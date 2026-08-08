import { defineContract } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract(
  {},
  ({ field, model, rel }) => ({
    models: {
      // ─────────────────────────────────────────────
      // 1. USER — email/password auth, lean profile
      // ─────────────────────────────────────────────
      User: model('User', {
        fields: {
          id: field.id.uuidv7String(),
          email: field.text().unique(),
          passwordHash: field.text(),
          name: field.text(),
          createdAt: field.temporal.createdAt(),
          updatedAt: field.temporal.updatedAt(),
        },
        relations: {
          bookings: rel.hasMany('Booking', { by: 'userId' }),
          heldSeats: rel.hasMany('ShowtimeSeat', { by: 'heldBy' }),
        },
      }),

      // ─────────────────────────────────────────────
      // 2. MOVIE — film catalogue, pre-seeded
      // ─────────────────────────────────────────────
      Movie: model('Movie', {
        fields: {
          id: field.id.uuidv7String(),
          title: field.text(),
          description: field.text().optional(),
          posterUrl: field.text().optional(),
          durationMinutes: field.int(),
          genre: field.text(),
          rating: field.text().optional(),
          releaseDate: field.temporal.timestamptz(),
          createdAt: field.temporal.createdAt(),
          updatedAt: field.temporal.updatedAt(),
        },
        relations: {
          showtimes: rel.hasMany('Showtime', { by: 'movieId' }),
        },
      }),

      // ─────────────────────────────────────────────
      // 3. THEATRE — cinema venue, pre-seeded
      // ─────────────────────────────────────────────
      Theatre: model('Theatre', {
        fields: {
          id: field.id.uuidv7String(),
          name: field.text(),
          address: field.text(),
          city: field.text(),
          createdAt: field.temporal.createdAt(),
          updatedAt: field.temporal.updatedAt(),
        },
        relations: {
          seats: rel.hasMany('Seat', { by: 'theatreId' }),
          showtimes: rel.hasMany('Showtime', { by: 'theatreId' }),
        },
      }),

      // ─────────────────────────────────────────────
      // 4. SEAT — physical seat in a theatre/screen
      //    Static, pre-seeded, never changes
      // ─────────────────────────────────────────────
      Seat: model('Seat', {
        fields: {
          id: field.id.uuidv7String(),
          theatreId: field.uuidString(),
          screenNumber: field.int(),
          row: field.text(),           // "A", "B", "F"
          col: field.int(),            // 1, 2, 12
          seatLabel: field.text(),     // "F12"
          seatType: field.text().default('REGULAR'), // REGULAR | PREMIUM | VIP
        },
        relations: {
          theatre: rel.belongsTo('Theatre', { from: 'theatreId', to: 'id' }),
          showtimeSeats: rel.hasMany('ShowtimeSeat', { by: 'seatId' }),
        },
      }),

      // ─────────────────────────────────────────────
      // 5. SHOWTIME — movie + theatre + screen + time
      //    Screen is flattened here (no Screen model)
      // ─────────────────────────────────────────────
      Showtime: model('Showtime', {
        fields: {
          id: field.id.uuidv7String(),
          movieId: field.uuidString(),
          theatreId: field.uuidString(),
          screenNumber: field.int(),
          screenName: field.text().optional(),   // "IMAX Hall", "Screen 3"
          startsAt: field.temporal.timestamptz(),
          endsAt: field.temporal.timestamptz(),
          priceCents: field.int(),               // integer cents: 45000 = ৳450.00
          createdAt: field.temporal.createdAt(),
          updatedAt: field.temporal.updatedAt(),
        },
        relations: {
          movie: rel.belongsTo('Movie', { from: 'movieId', to: 'id' }),
          theatre: rel.belongsTo('Theatre', { from: 'theatreId', to: 'id' }),
          showtimeSeats: rel.hasMany('ShowtimeSeat', { by: 'showtimeId' }),
          bookings: rel.hasMany('Booking', { by: 'showtimeId' }),
        },
      }),

      // ─────────────────────────────────────────────
      // 6. SHOWTIME_SEAT — the concurrency battleground
      //    One row per seat per showtime
      //    SELECT ... FOR UPDATE locks on (showtimeId, seatId)
      // ─────────────────────────────────────────────
      ShowtimeSeat: model('ShowtimeSeat', {
        fields: {
          id: field.id.uuidv7String(),
          showtimeId: field.uuidString(),
          seatId: field.uuidString(),
          status: field.text().default('AVAILABLE'), // AVAILABLE | HELD | BOOKED
          heldBy: field.uuidString().optional(),     // userId who placed the hold
          holdExpiresAt: field.temporal.timestamptz().optional(), // lazy expiry check
          bookingId: field.uuidString().optional(),  // set after payment confirmed
          version: field.int().default(1),           // optimistic locking
          createdAt: field.temporal.createdAt(),
          updatedAt: field.temporal.updatedAt(),
        },
        relations: {
          showtime: rel.belongsTo('Showtime', { from: 'showtimeId', to: 'id' }),
          seat: rel.belongsTo('Seat', { from: 'seatId', to: 'id' }),
          holder: rel.belongsTo('User', { from: 'heldBy', to: 'id' }),
          booking: rel.belongsTo('Booking', { from: 'bookingId', to: 'id' }),
        },
      }),

      // ─────────────────────────────────────────────
      // 7. BOOKING — user's ticket order
      // ─────────────────────────────────────────────
      Booking: model('Booking', {
        fields: {
          id: field.id.uuidv7String(),
          bookingRef: field.text().unique(),  // "BK-abc123" — sent to gateway
          userId: field.uuidString(),
          showtimeId: field.uuidString(),
          status: field.text().default('PENDING'), // PENDING | CONFIRMED | CANCELLED | EXPIRED
          totalAmountCents: field.int(),     // sum of seat prices in integer cents
          seatCount: field.int(),            // denormalized for quick display
          createdAt: field.temporal.createdAt(),
          updatedAt: field.temporal.updatedAt(),
        },
        relations: {
          user: rel.belongsTo('User', { from: 'userId', to: 'id' }),
          showtime: rel.belongsTo('Showtime', { from: 'showtimeId', to: 'id' }),
          seats: rel.hasMany('ShowtimeSeat', { by: 'bookingId' }),
          payments: rel.hasMany('Payment', { by: 'bookingId' }),
        },
      }),

      // ─────────────────────────────────────────────
      // 8. PAYMENT — async payment lifecycle
      // ─────────────────────────────────────────────
      Payment: model('Payment', {
        fields: {
          id: field.id.uuidv7String(),
          bookingId: field.uuidString(),
          gatewayPaymentId: field.text().optional(), // from gateway /charge response
          amountCents: field.int(),
          currency: field.text().default('BDT'),
          status: field.text().default('PENDING'), // PENDING | SUCCEEDED | FAILED | REFUNDED
          createdAt: field.temporal.createdAt(),
          updatedAt: field.temporal.updatedAt(),
        },
        relations: {
          booking: rel.belongsTo('Booking', { from: 'bookingId', to: 'id' }),
        },
      }),

      // ─────────────────────────────────────────────
      // 9. WEBHOOK_EVENT — idempotency for gateway callbacks
      //    INSERT ON CONFLICT DO NOTHING RETURNING
      //    Write-once: never updated after insert
      // ─────────────────────────────────────────────
      WebhookEvent: model('WebhookEvent', {
        fields: {
          id: field.id.uuidv7String(),
          eventId: field.text().unique(),   // gateway event_id — idempotency key
          paymentId: field.text(),          // gateway payment_id
          bookingRef: field.text(),         // gateway booking_ref
          status: field.text(),            // SUCCEEDED | FAILED | REFUNDED
          amountCents: field.int(),
          receivedAt: field.temporal.timestamptz(),
        },
      }),
    },
  }),
);
