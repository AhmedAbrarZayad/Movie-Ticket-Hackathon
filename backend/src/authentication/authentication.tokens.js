import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';

const ISSUER = 'cinemaseat-api';
const ACCESS_AUDIENCE = 'cinemaseat-web';
const REFRESH_AUDIENCE = 'cinemaseat-refresh';
const ACCESS_TTL = '15m';
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

function requireSecret(name) {
  const value = process.env[name];
  if (!value || value.length < 32) {
    throw new Error(`${name} must contain at least 32 characters.`);
  }
  return value;
}

export function createAccessToken(userId) {
  return jwt.sign({}, requireSecret('JWT_ACCESS_SECRET'), {
    algorithm: 'HS256',
    subject: userId,
    issuer: ISSUER,
    audience: ACCESS_AUDIENCE,
    expiresIn: ACCESS_TTL,
  });
}

export function createRefreshToken(userId, sessionId = randomUUID()) {
  const token = jwt.sign({ type: 'refresh', sid: sessionId }, requireSecret('JWT_REFRESH_SECRET'), {
    algorithm: 'HS256',
    subject: userId,
    issuer: ISSUER,
    audience: REFRESH_AUDIENCE,
    jwtid: randomUUID(),
    expiresIn: REFRESH_TTL_SECONDS,
  });

  return {
    token,
    sessionId,
    expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
  };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, requireSecret('JWT_ACCESS_SECRET'), {
    algorithms: ['HS256'],
    issuer: ISSUER,
    audience: ACCESS_AUDIENCE,
  });
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, requireSecret('JWT_REFRESH_SECRET'), {
    algorithms: ['HS256'],
    issuer: ISSUER,
    audience: REFRESH_AUDIENCE,
  });

  if (typeof payload === 'string' || payload.type !== 'refresh' || !payload.sid || !payload.sub) {
    throw new Error('Invalid refresh token payload.');
  }
  return payload;
}

export function decodeRefreshToken(token) {
  const payload = jwt.decode(token);
  return typeof payload === 'object' && payload ? payload : null;
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function tokenHashesMatch(left, right) {
  if (!left || !right || left.length !== right.length) return false;
  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}
