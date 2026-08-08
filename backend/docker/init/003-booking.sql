ALTER TABLE "Movie" DROP COLUMN IF EXISTS "tmdbId";

CREATE TABLE IF NOT EXISTS "SeatHold" (
  id uuid PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "showtimeId" uuid NOT NULL REFERENCES "Showtime"(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONVERTED', 'EXPIRED', 'RELEASED')),
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "holdId" uuid REFERENCES "SeatHold"(id) ON DELETE SET NULL;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "otpVerifiedAt" timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_holdId_key" ON "Booking" ("holdId") WHERE "holdId" IS NOT NULL;

ALTER TABLE "ShowtimeSeat" ADD COLUMN IF NOT EXISTS "holdId" uuid REFERENCES "SeatHold"(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "SeatHold_expiry_idx" ON "SeatHold" (status, "expiresAt");
CREATE INDEX IF NOT EXISTS "ShowtimeSeat_hold_idx" ON "ShowtimeSeat" ("holdId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_booking_active_key" ON "Payment" ("bookingId") WHERE status = 'PENDING';
