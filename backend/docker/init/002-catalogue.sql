CREATE TABLE IF NOT EXISTS "Movie" (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  "posterUrl" text,
  "backdropUrl" text,
  "trailerUrl" text,
  "durationMinutes" integer NOT NULL,
  genre text NOT NULL,
  rating text,
  status text NOT NULL CHECK (status IN ('now-showing', 'coming-soon')),
  "releaseDate" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Theatre" (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Seat" (
  id uuid PRIMARY KEY,
  "theatreId" uuid NOT NULL REFERENCES "Theatre"(id) ON DELETE CASCADE,
  "screenNumber" integer NOT NULL,
  row text NOT NULL,
  col integer NOT NULL,
  "seatLabel" text NOT NULL,
  "seatType" text NOT NULL DEFAULT 'REGULAR',
  UNIQUE ("theatreId", "screenNumber", row, col)
);

CREATE TABLE IF NOT EXISTS "Showtime" (
  id uuid PRIMARY KEY,
  "movieId" uuid NOT NULL REFERENCES "Movie"(id) ON DELETE CASCADE,
  "theatreId" uuid NOT NULL REFERENCES "Theatre"(id) ON DELETE CASCADE,
  "screenNumber" integer NOT NULL,
  "screenName" text,
  "startsAt" timestamptz NOT NULL,
  "endsAt" timestamptz NOT NULL,
  "priceCents" integer NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Booking" (
  id uuid PRIMARY KEY,
  "bookingRef" text NOT NULL UNIQUE,
  "userId" uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "showtimeId" uuid NOT NULL REFERENCES "Showtime"(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'PENDING',
  "totalAmountCents" integer NOT NULL,
  "seatCount" integer NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Payment" (
  id uuid PRIMARY KEY,
  "bookingId" uuid NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE,
  "gatewayPaymentId" text,
  "amountCents" integer NOT NULL,
  currency text NOT NULL DEFAULT 'BDT',
  status text NOT NULL DEFAULT 'PENDING',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "ShowtimeSeat" (
  id uuid PRIMARY KEY,
  "showtimeId" uuid NOT NULL REFERENCES "Showtime"(id) ON DELETE CASCADE,
  "seatId" uuid NOT NULL REFERENCES "Seat"(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'AVAILABLE',
  "heldBy" uuid REFERENCES "User"(id) ON DELETE SET NULL,
  "holdExpiresAt" timestamptz,
  "bookingId" uuid REFERENCES "Booking"(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("showtimeId", "seatId")
);

CREATE TABLE IF NOT EXISTS "WebhookEvent" (
  id uuid PRIMARY KEY,
  "eventId" text NOT NULL UNIQUE,
  "paymentId" text NOT NULL,
  "bookingRef" text NOT NULL,
  status text NOT NULL,
  "amountCents" integer NOT NULL,
  "receivedAt" timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS "Showtime_movie_date_idx" ON "Showtime" ("movieId", "startsAt");
CREATE INDEX IF NOT EXISTS "Showtime_theatre_idx" ON "Showtime" ("theatreId");
CREATE INDEX IF NOT EXISTS "ShowtimeSeat_showtime_status_idx" ON "ShowtimeSeat" ("showtimeId", status);
