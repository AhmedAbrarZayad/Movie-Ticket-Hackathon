import bcrypt from 'bcryptjs';
import { AuthenticationError } from './authentication.errors.js';
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  tokenHashesMatch,
  verifyRefreshToken,
} from './authentication.tokens.js';

const INVALID_CREDENTIALS = new AuthenticationError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');

export function createAuthenticationService(repository) {
  async function createSession(user) {
    const refresh = createRefreshToken(user.id);
    await repository.createRefreshSession({
      id: refresh.sessionId,
      userId: user.id,
      tokenHash: hashToken(refresh.token),
      expiresAt: refresh.expiresAt,
    });
    return { user, accessToken: createAccessToken(user.id), refreshToken: refresh.token };
  }

  return {
    async register(input) {
      if (await repository.findUserByEmail(input.email)) {
        throw new AuthenticationError(409, 'EMAIL_IN_USE', 'An account with this email already exists.');
      }

      try {
        const user = await repository.createUser({
          ...input,
          passwordHash: await bcrypt.hash(input.password, 12),
        });
        return createSession(user);
      } catch (error) {
        if (error?.code === '23505') {
          throw new AuthenticationError(409, 'EMAIL_IN_USE', 'An account with this email already exists.');
        }
        throw error;
      }
    },

    async login(input) {
      const storedUser = await repository.findUserByEmail(input.email);
      if (!storedUser || !(await bcrypt.compare(input.password, storedUser.passwordHash))) {
        throw INVALID_CREDENTIALS;
      }
      const user = { id: storedUser.id, email: storedUser.email, name: storedUser.name };
      return createSession(user);
    },

    async refresh(token) {
      let payload;
      try {
        payload = verifyRefreshToken(token);
      } catch {
        throw new AuthenticationError(401, 'INVALID_REFRESH_TOKEN', 'The session has expired.');
      }

      const session = await repository.findRefreshSession(payload.sid);
      const presentedHash = hashToken(token);
      if (
        !session ||
        session.userId !== payload.sub ||
        session.revokedAt ||
        new Date(session.expiresAt) <= new Date() ||
        !tokenHashesMatch(session.tokenHash, presentedHash)
      ) {
        if (session) await repository.revokeRefreshSession(session.id);
        throw new AuthenticationError(401, 'INVALID_REFRESH_TOKEN', 'The session has expired.');
      }

      const next = createRefreshToken(payload.sub, payload.sid);
      const rotated = await repository.rotateRefreshSession({
        id: payload.sid,
        previousTokenHash: presentedHash,
        tokenHash: hashToken(next.token),
        expiresAt: next.expiresAt,
      });
      if (!rotated) {
        throw new AuthenticationError(401, 'INVALID_REFRESH_TOKEN', 'The session has expired.');
      }

      const user = await repository.findPublicUserById(payload.sub);
      if (!user) throw new AuthenticationError(401, 'INVALID_REFRESH_TOKEN', 'The session has expired.');
      return { user, accessToken: createAccessToken(user.id), refreshToken: next.token };
    },

    async getCurrentUser(userId) {
      const user = await repository.findPublicUserById(userId);
      if (!user) throw new AuthenticationError(401, 'UNAUTHORIZED', 'Authentication is required.');
      return user;
    },
  };
}
