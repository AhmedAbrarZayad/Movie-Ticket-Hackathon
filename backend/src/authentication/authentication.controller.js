import { clearRefreshCookie, REFRESH_COOKIE, refreshCookieOptions } from './authentication.cookies.js';
import { AuthenticationError } from './authentication.errors.js';
import { verifyRefreshToken } from './authentication.tokens.js';

function sendSession(response, session, status = 200) {
  response.cookie(REFRESH_COOKIE, session.refreshToken, refreshCookieOptions());
  response.status(status).json({ user: session.user, accessToken: session.accessToken });
}

export function createAuthenticationController(service, repository) {
  return {
    register: async (request, response) => sendSession(response, await service.register(request.validatedBody), 201),
    login: async (request, response) => sendSession(response, await service.login(request.validatedBody)),
    refresh: async (request, response) => {
      const token = request.cookies[REFRESH_COOKIE];
      if (!token) throw new AuthenticationError(401, 'INVALID_REFRESH_TOKEN', 'The session has expired.');
      sendSession(response, await service.refresh(token));
    },
    logout: async (request, response) => {
      const token = request.cookies[REFRESH_COOKIE];
      let payload = null;
      try {
        payload = token ? verifyRefreshToken(token) : null;
      } catch {
        // Invalid or expired cookies are still cleared, but cannot revoke another session.
      }
      if (payload?.sid) await repository.revokeRefreshSession(payload.sid);
      clearRefreshCookie(response);
      response.status(204).end();
    },
    me: async (request, response) => response.json({ user: await service.getCurrentUser(request.userId) }),
  };
}
