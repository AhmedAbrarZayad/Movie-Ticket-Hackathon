import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { seedDatabase } from '../../scripts/seed.js';
import { createBookingRepository } from '../../src/booking/booking.repository.js';
import { createBookingService } from '../../src/booking/booking.service.js';
import { connectedRedis } from '../../src/booking/redis.js';

const run = process.env.RUN_INTEGRATION_TESTS === 'true' ? test : test.skip;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
let redis;

before(async () => { if (process.env.RUN_INTEGRATION_TESTS === 'true') { redis = await connectedRedis(); await redis.flushDb(); } });
after(async () => { if (redis?.isOpen) await redis.quit(); await pool.end(); });

async function reset() { await seedDatabase({ pool, now: new Date() }); await redis.flushDb(); }
async function user(index) {
  const id = randomUUID();
  await pool.query(`INSERT INTO "User" (id,email,"passwordHash",name) VALUES ($1,$2,'integration-hash',$3)`, [id, `load-${index}-${id}@example.com`, `Load ${index}`]);
  return id;
}
async function inventory() {
  const result = await pool.query(`SELECT ss."showtimeId",ss."seatId" FROM "ShowtimeSeat" ss JOIN "Showtime" s ON s.id=ss."showtimeId" ORDER BY s."startsAt",ss."seatId" LIMIT 1`);
  return result.rows[0];
}

run('100 users competing for one seat produce exactly one hold and zero oversells', async () => {
  await reset(); process.env.HOLD_TTL_SECONDS = '30';
  const users = await Promise.all(Array.from({ length: 100 }, (_, i) => user(i)));
  const seat = await inventory(); const repository = createBookingRepository(pool); const service = createBookingService(repository);
  const results = await Promise.allSettled(users.map((userId) => service.hold(userId, seat.showtimeId, [seat.seatId])));
  assert.equal(results.filter(({ status }) => status === 'fulfilled').length, 1);
  assert.equal(results.filter(({ status, reason }) => status === 'rejected' && reason.code === 'SEATS_UNAVAILABLE').length, 99);
  const state = await pool.query(`SELECT status,COUNT(*)::int AS count FROM "ShowtimeSeat" WHERE "showtimeId"=$1 AND "seatId"=$2 GROUP BY status`, [seat.showtimeId, seat.seatId]);
  assert.deepEqual(state.rows[0], { status: 'HELD', count: 1 });
});

run('an expired hold is lazily released and reacquired by another user', async () => {
  await reset(); process.env.HOLD_TTL_SECONDS = '1';
  const [first, second] = await Promise.all([user('expiry-a'), user('expiry-b')]);
  const seat = await inventory(); const service = createBookingService(createBookingRepository(pool));
  await service.hold(first, seat.showtimeId, [seat.seatId]);
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const replacement = await service.hold(second, seat.showtimeId, [seat.seatId]);
  assert.equal(replacement.seats[0].id, seat.seatId);
  const held = await pool.query(`SELECT "heldBy",status FROM "ShowtimeSeat" WHERE "showtimeId"=$1 AND "seatId"=$2`, [seat.showtimeId, seat.seatId]);
  assert.deepEqual(held.rows[0], { heldBy: second, status: 'HELD' });
});

run('simultaneous pay requests create one payment and one outbound charge', async () => {
  await reset(); process.env.HOLD_TTL_SECONDS = '30';
  const userId = await user('payment'); const seat = await inventory(); const repository = createBookingRepository(pool);
  const setup = createBookingService(repository); const hold = await setup.hold(userId, seat.showtimeId, [seat.seatId]);
  const booking = await setup.createBooking(userId, hold.id); await repository.markOtpVerified(booking.id, userId);
  let charges = 0;
  const gateway = { charge: async () => { charges += 1; await new Promise((resolve) => setTimeout(resolve, 100)); return { payment_id: 'pay-concurrency', status: 'PENDING' }; } };
  const service = createBookingService(repository, gateway);
  const results = await Promise.all(Array.from({ length: 25 }, () => service.pay(userId, booking.id)));
  assert.equal(charges, 1); assert.equal(results.length, 25);
  const payments = await pool.query(`SELECT COUNT(*)::int AS count,MAX("gatewayPaymentId") AS gateway FROM "Payment" WHERE "bookingId"=$1`, [booking.id]);
  assert.deepEqual(payments.rows[0], { count: 1, gateway: 'pay-concurrency' });
});
