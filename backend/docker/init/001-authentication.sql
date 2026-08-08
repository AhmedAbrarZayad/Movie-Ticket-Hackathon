CREATE TABLE IF NOT EXISTS "User" (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  "passwordHash" text NOT NULL,
  name text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "RefreshSession" (
  id uuid PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "tokenHash" text NOT NULL UNIQUE,
  "expiresAt" timestamptz NOT NULL,
  "revokedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "RefreshSession_userId_idx" ON "RefreshSession" ("userId");
CREATE INDEX IF NOT EXISTS "RefreshSession_expiresAt_idx" ON "RefreshSession" ("expiresAt");
