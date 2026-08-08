import { randomUUID } from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;
let sharedPool;

export function getPool() {
  sharedPool ??= new Pool({ connectionString: process.env.DATABASE_URL });
  return sharedPool;
}

function publicUser(user) {
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name };
}

export function createAuthenticationRepository(pool = getPool()) {
  return {
    async findUserByEmail(email) {
      const result = await pool.query(
        'SELECT id, email, "passwordHash", name FROM "User" WHERE email = $1 LIMIT 1',
        [email],
      );
      return result.rows[0] ?? null;
    },

    async findPublicUserById(id) {
      const result = await pool.query('SELECT id, email, name FROM "User" WHERE id = $1 LIMIT 1', [id]);
      return publicUser(result.rows[0]);
    },

    async createUser({ email, passwordHash, name }) {
      const result = await pool.query(
        `INSERT INTO "User" (id, email, "passwordHash", name, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, now(), now()) RETURNING id, email, name`,
        [randomUUID(), email, passwordHash, name],
      );
      return publicUser(result.rows[0]);
    },

    async createRefreshSession({ id, userId, tokenHash, expiresAt }) {
      await pool.query(
        `INSERT INTO "RefreshSession" (id, "userId", "tokenHash", "expiresAt", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, now(), now())`,
        [id, userId, tokenHash, expiresAt],
      );
    },

    async findRefreshSession(id) {
      const result = await pool.query(
        `SELECT id, "userId", "tokenHash", "expiresAt", "revokedAt"
         FROM "RefreshSession" WHERE id = $1 LIMIT 1`,
        [id],
      );
      return result.rows[0] ?? null;
    },

    async rotateRefreshSession({ id, previousTokenHash, tokenHash, expiresAt }) {
      const result = await pool.query(
        `UPDATE "RefreshSession" SET "tokenHash" = $1, "expiresAt" = $2, "updatedAt" = now()
         WHERE id = $3 AND "tokenHash" = $4 AND "revokedAt" IS NULL RETURNING id`,
        [tokenHash, expiresAt, id, previousTokenHash],
      );
      return result.rowCount === 1;
    },

    async revokeRefreshSession(id) {
      await pool.query(
        `UPDATE "RefreshSession" SET "revokedAt" = COALESCE("revokedAt", now()), "updatedAt" = now()
         WHERE id = $1`,
        [id],
      );
    },
  };
}
