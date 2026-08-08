import { AuthenticationError } from './authentication.errors.js';
import { verifyAccessToken } from './authentication.tokens.js';

export function requireAuthentication(request, response, next) {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
  if (scheme !== 'Bearer' || !token) {
    next(new AuthenticationError(401, 'UNAUTHORIZED', 'Authentication is required.'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    if (typeof payload === 'string' || !payload.sub) throw new Error('Missing subject');
    request.userId = payload.sub;
    next();
  } catch {
    next(new AuthenticationError(401, 'UNAUTHORIZED', 'Authentication is required.'));
  }
}
