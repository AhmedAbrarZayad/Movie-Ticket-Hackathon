import { createBrowserRouter } from 'react-router-dom'
import { routes } from '../config/routes'
import { HomeRoute } from './routes/home'
import { MovieDetailsRoute } from './routes/movie-details'
import { BookingRoute } from './routes/booking'
import { PaymentRoute } from './routes/payment'
import { BookingConfirmationRoute } from './routes/booking-confirmation'
import { NotFoundRoute } from './routes/not-found'
import { LoginRoute } from './routes/login'
import { RegisterRoute } from './routes/register'

export const appRouter = createBrowserRouter([
  {
    path: routes.home,
    element: <HomeRoute />,
  },
  {
    path: routes.movieDetails,
    element: <MovieDetailsRoute />,
  },
  {
    path: routes.booking,
    element: <BookingRoute />,
  },
  {
    path: routes.payment,
    element: <PaymentRoute />,
  },
  {
    path: routes.bookingConfirmation,
    element: <BookingConfirmationRoute />,
  },
  {
    path: routes.login,
    element: <LoginRoute />,
  },
  {
    path: routes.register,
    element: <RegisterRoute />,
  },
  {
    path: '*',
    element: <NotFoundRoute />,
  },
])
