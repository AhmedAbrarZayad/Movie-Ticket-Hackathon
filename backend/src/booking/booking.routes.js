import { Router } from 'express';
import { requireAuthentication } from '../authentication/authentication.middleware.js';
import { createBookingController } from './booking.controller.js';
import { BookingError } from './booking.errors.js';

const route = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
export function createBookingRouters(controller = createBookingController()) {
  const showtimes = Router(); const bookings = Router(); const webhooks = Router();
  showtimes.get('/:showtimeId/seats', route(controller.seatMap));
  showtimes.post('/:showtimeId/holds', requireAuthentication, route(controller.hold));
  bookings.use(requireAuthentication);
  bookings.post('/', route(controller.create));
  bookings.get('/', route(controller.list));
  bookings.get('/:bookingId', route(controller.details));
  bookings.post('/:bookingId/otp/send', route(controller.sendOtp));
  bookings.post('/:bookingId/otp/verify', route(controller.verifyOtp));
  bookings.post('/:bookingId/pay', route(controller.pay));
  bookings.post('/:bookingId/refund', route(controller.refund));
  webhooks.post('/gateway', route(controller.webhook));
  webhooks.post('/otp', route(controller.otpWebhook));
  return { showtimes, bookings, webhooks };
}
export function bookingErrorHandler(error, req, res, next) {
  if (!(error instanceof BookingError)) return next(error);
  res.status(error.status).json({ success: false, error: { code: error.code, message: error.message, ...(error.details && { details: error.details }) } });
}
