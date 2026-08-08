export const routes = {
  home: '/',
  movieDetails: '/movie/:movieId',
  booking: '/booking/:movieId',
  payment: '/payment/:movieId',
  bookingConfirmation: '/booking-confirmation/:movieId',
  login: '/login',
  register: '/register',
} as const
