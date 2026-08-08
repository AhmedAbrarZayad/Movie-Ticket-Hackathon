import { randomUUID } from 'node:crypto';
import { getPool } from '../authentication/authentication.repository.js';

export function createBookingRepository(pool = getPool()) {
  async function transaction(work) {
    const client = await pool.connect();
    try { await client.query('BEGIN'); const result = await work(client); await client.query('COMMIT'); return result; }
    catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  }

  async function expire(client) {
    const expired = await client.query(
      `UPDATE "SeatHold" SET status='EXPIRED', "updatedAt"=now()
       WHERE status IN ('ACTIVE','CONVERTED') AND "expiresAt" <= now() RETURNING id`,
    );
    if (expired.rows.length) {
      const ids = expired.rows.map(({ id }) => id);
      await client.query(
        `UPDATE "ShowtimeSeat" SET status='AVAILABLE', "heldBy"=NULL, "holdExpiresAt"=NULL,
          "holdId"=NULL, "bookingId"=NULL, version=version+1, "updatedAt"=now()
         WHERE "holdId" = ANY($1::uuid[]) AND status='HELD'`, [ids],
      );
      await client.query(
        `UPDATE "Booking" SET status='EXPIRED', "updatedAt"=now()
         WHERE "holdId" = ANY($1::uuid[]) AND status='PENDING'`, [ids],
      );
    }
    return expired.rows.map(({ id }) => id);
  }

  return {
    transaction,
    async expireHolds() { return transaction(expire); },
    async seatMap(showtimeId) {
      await transaction(expire);
      const show = await pool.query(
        `SELECT s.id, s."startsAt", s."priceCents", s."screenName", m.title, t.name AS "theatreName"
         FROM "Showtime" s JOIN "Movie" m ON m.id=s."movieId" JOIN "Theatre" t ON t.id=s."theatreId"
         WHERE s.id=$1`, [showtimeId],
      );
      if (!show.rows[0]) return null;
      const seats = await pool.query(
        `SELECT seat.id, seat.row, seat.col, seat."seatLabel", seat."seatType", ss.status
         FROM "ShowtimeSeat" ss JOIN "Seat" seat ON seat.id=ss."seatId"
         WHERE ss."showtimeId"=$1 ORDER BY seat.row, seat.col`, [showtimeId],
      );
      return { ...show.rows[0], seats: seats.rows };
    },
    async createHold({ id, userId, showtimeId, seatIds, expiresAt }) {
      return transaction(async (client) => {
        await expire(client);
        const result = await client.query(
          `SELECT ss.id, ss."seatId", ss.status, s."priceCents", seat."seatLabel"
           FROM "ShowtimeSeat" ss JOIN "Showtime" s ON s.id=ss."showtimeId"
           JOIN "Seat" seat ON seat.id=ss."seatId"
           WHERE ss."showtimeId"=$1 AND ss."seatId"=ANY($2::uuid[])
           ORDER BY ss."seatId" FOR UPDATE OF ss`, [showtimeId, seatIds],
        );
        if (result.rows.length !== seatIds.length || result.rows.some(({ status }) => status !== 'AVAILABLE')) return null;
        await client.query(
          `INSERT INTO "SeatHold" (id,"userId","showtimeId",status,"expiresAt") VALUES ($1,$2,$3,'ACTIVE',$4)`,
          [id, userId, showtimeId, expiresAt],
        );
        await client.query(
          `UPDATE "ShowtimeSeat" SET status='HELD', "heldBy"=$1, "holdExpiresAt"=$2, "holdId"=$3,
            version=version+1, "updatedAt"=now() WHERE "showtimeId"=$4 AND "seatId"=ANY($5::uuid[])`,
          [userId, expiresAt, id, showtimeId, seatIds],
        );
        return { id, showtimeId, expiresAt, seats: result.rows.map(({ seatId, seatLabel }) => ({ id: seatId, label: seatLabel })), totalAmountCents: result.rows[0].priceCents * result.rows.length };
      });
    },
    async createBooking(userId, holdId) {
      return transaction(async (client) => {
        await expire(client);
        const existing = await client.query('SELECT * FROM "Booking" WHERE "holdId"=$1 AND "userId"=$2', [holdId, userId]);
        if (existing.rows[0]) return existing.rows[0];
        const hold = await client.query(`SELECT * FROM "SeatHold" WHERE id=$1 FOR UPDATE`, [holdId]);
        const row = hold.rows[0];
        if (!row || row.userId !== userId || row.status !== 'ACTIVE' || new Date(row.expiresAt) <= new Date()) return null;
        const inventory = await client.query(
          `SELECT ss.id, s."priceCents" FROM "ShowtimeSeat" ss JOIN "Showtime" s ON s.id=ss."showtimeId"
           WHERE ss."holdId"=$1 AND ss.status='HELD' FOR UPDATE OF ss`, [holdId],
        );
        if (!inventory.rows.length) return null;
        const id = randomUUID(); const bookingRef = `BK-${id.slice(0, 8).toUpperCase()}`;
        const total = inventory.rows[0].priceCents * inventory.rows.length;
        const booking = await client.query(
          `INSERT INTO "Booking" (id,"bookingRef","userId","showtimeId",status,"totalAmountCents","seatCount","holdId")
           VALUES ($1,$2,$3,$4,'PENDING',$5,$6,$7) RETURNING *`,
          [id, bookingRef, userId, row.showtimeId, total, inventory.rows.length, holdId],
        );
        await client.query(`UPDATE "SeatHold" SET status='CONVERTED', "updatedAt"=now() WHERE id=$1`, [holdId]);
        await client.query(`UPDATE "ShowtimeSeat" SET "bookingId"=$1, "updatedAt"=now() WHERE "holdId"=$2`, [id, holdId]);
        return booking.rows[0];
      });
    },
    async findOwnedBooking(id, userId) { const r = await pool.query('SELECT * FROM "Booking" WHERE id=$1 AND "userId"=$2', [id, userId]); return r.rows[0] ?? null; },
    async markOtpVerified(id, userId) { const r = await pool.query('UPDATE "Booking" SET "otpVerifiedAt"=now(), "updatedAt"=now() WHERE id=$1 AND "userId"=$2 RETURNING *', [id, userId]); return r.rows[0] ?? null; },
    async createPayment(booking) {
      const existing = await pool.query(`SELECT * FROM "Payment" WHERE "bookingId"=$1 AND status='PENDING' LIMIT 1`, [booking.id]);
      if (existing.rows[0]) return { payment: existing.rows[0], created: false };
      const r = await pool.query(
        `INSERT INTO "Payment" (id,"bookingId","amountCents",currency,status) VALUES ($1,$2,$3,'BDT','PENDING')
         ON CONFLICT ("bookingId") WHERE status='PENDING' DO NOTHING RETURNING *`,
        [randomUUID(), booking.id, booking.totalAmountCents],
      );
      if (r.rows[0]) return { payment: r.rows[0], created: true };
      const concurrent = await pool.query(`SELECT * FROM "Payment" WHERE "bookingId"=$1 AND status='PENDING' LIMIT 1`, [booking.id]);
      return { payment: concurrent.rows[0], created: false };
    },
    async claimPaymentInitiation(id) {
      const result = await pool.query(
        `UPDATE "Payment" SET "chargeStartedAt"=now(),"updatedAt"=now()
         WHERE id=$1 AND "gatewayPaymentId" IS NULL
           AND ("chargeStartedAt" IS NULL OR "chargeStartedAt" < now() - interval '10 seconds')
         RETURNING id`, [id],
      );
      return result.rowCount === 1;
    },
    async releasePaymentInitiation(id) { await pool.query(`UPDATE "Payment" SET "chargeStartedAt"=NULL,"updatedAt"=now() WHERE id=$1 AND "gatewayPaymentId" IS NULL`, [id]); },
    async setGatewayPaymentId(id, gatewayPaymentId) { await pool.query('UPDATE "Payment" SET "gatewayPaymentId"=$1,"chargeStartedAt"=NULL,"updatedAt"=now() WHERE id=$2', [gatewayPaymentId, id]); },
    async successfulPayment(bookingId) { const r = await pool.query(`SELECT * FROM "Payment" WHERE "bookingId"=$1 AND status='SUCCEEDED' ORDER BY "createdAt" DESC LIMIT 1`, [bookingId]); return r.rows[0] ?? null; },
    async processWebhook(event) {
      return transaction(async (client) => {
        const inserted = await client.query(
          `INSERT INTO "WebhookEvent" (id,"eventId","paymentId","bookingRef",status,"amountCents","receivedAt")
           VALUES ($1,$2,$3,$4,$5,$6,now()) ON CONFLICT ("eventId") DO NOTHING RETURNING id`,
          [randomUUID(), event.event_id, event.payment_id, event.booking_ref, event.status, Math.round(Number(event.amount) * 100)],
        );
        if (!inserted.rowCount) return { duplicate: true };
        const bookingResult = await client.query('SELECT * FROM "Booking" WHERE "bookingRef"=$1 FOR UPDATE', [event.booking_ref]);
        const booking = bookingResult.rows[0];
        const expectedBookingStatus = event.status === 'REFUNDED' ? 'CONFIRMED' : 'PENDING';
        if (!booking || booking.status !== expectedBookingStatus || booking.totalAmountCents !== Math.round(Number(event.amount) * 100)) return { ignored: true };
        const payment = await client.query(
          `SELECT * FROM "Payment" WHERE "bookingId"=$1
           ORDER BY ("gatewayPaymentId"=$2) DESC, "createdAt" DESC LIMIT 1 FOR UPDATE`, [booking.id, event.payment_id],
        );
        if (!payment.rows[0]) return { ignored: true };
        await client.query(`UPDATE "Payment" SET status=$1,"gatewayPaymentId"=COALESCE("gatewayPaymentId",$2),"updatedAt"=now() WHERE id=$3`, [event.status, event.payment_id, payment.rows[0].id]);
        if (event.status === 'SUCCEEDED') {
          await client.query(`UPDATE "Booking" SET status='CONFIRMED',"updatedAt"=now() WHERE id=$1`, [booking.id]);
          await client.query(`UPDATE "ShowtimeSeat" SET status='BOOKED',"holdExpiresAt"=NULL,"updatedAt"=now() WHERE "bookingId"=$1`, [booking.id]);
        } else if (event.status === 'FAILED') {
          await client.query(`UPDATE "Booking" SET status='FAILED',"updatedAt"=now() WHERE id=$1`, [booking.id]);
          await client.query(`UPDATE "ShowtimeSeat" SET status='AVAILABLE',"heldBy"=NULL,"holdExpiresAt"=NULL,"holdId"=NULL,"bookingId"=NULL,"updatedAt"=now() WHERE "bookingId"=$1`, [booking.id]);
        } else if (event.status === 'REFUNDED') {
          await client.query(`UPDATE "Booking" SET status='REFUNDED',"updatedAt"=now() WHERE id=$1`, [booking.id]);
          await client.query(`UPDATE "ShowtimeSeat" SET status='AVAILABLE',"heldBy"=NULL,"holdExpiresAt"=NULL,"holdId"=NULL,"bookingId"=NULL,"updatedAt"=now() WHERE "bookingId"=$1`, [booking.id]);
        }
        return { duplicate: false, bookingStatus: event.status === 'SUCCEEDED' ? 'CONFIRMED' : event.status };
      });
    },
    async listBookings(userId) { const r = await pool.query('SELECT * FROM "Booking" WHERE "userId"=$1 ORDER BY "createdAt" DESC', [userId]); return r.rows; },
    async bookingDetails(id, userId) {
      const booking = await this.findOwnedBooking(id, userId); if (!booking) return null;
      const seats = await pool.query(`SELECT s."seatLabel",s.row,s.col,s."seatType" FROM "ShowtimeSeat" ss JOIN "Seat" s ON s.id=ss."seatId" WHERE ss."bookingId"=$1 ORDER BY s.row,s.col`, [id]);
      const payments = await pool.query('SELECT id,"gatewayPaymentId","amountCents",currency,status,"createdAt" FROM "Payment" WHERE "bookingId"=$1 ORDER BY "createdAt" DESC', [id]);
      return { ...booking, seats: seats.rows, payments: payments.rows };
    },
  };
}
