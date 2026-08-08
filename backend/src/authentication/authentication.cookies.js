export const REFRESH_COOKIE = 'cinemaseat_refresh';

export function refreshCookieOptions() {
  const secure = process.env.COOKIE_SECURE === undefined
    ? process.env.NODE_ENV === 'production'
    : process.env.COOKIE_SECURE === 'true';
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function clearRefreshCookie(response) {
  const { maxAge, ...options } = refreshCookieOptions();
  response.clearCookie(REFRESH_COOKIE, options);
}
