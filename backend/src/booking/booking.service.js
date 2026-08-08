import { randomUUID } from 'node:crypto';
import { createBookingRepository } from './booking.repository.js';
import { BookingError } from './booking.errors.js';
import { acquireSeatLocks, connectedRedis, releaseKeys } from './redis.js';
import { gatewayClient } from './gateway.client.js';

const ttl = () => Math.max(1, Number(process.env.HOLD_TTL_SECONDS ?? 300));
const otpTtl = () => Math.max(30, Number(process.env.OTP_TTL_SECONDS ?? 300));
const requireFound = (value, message = 'Booking not found.') => { if (!value) throw new BookingError(404, 'NOT_FOUND', message); return value; };

export function createBookingService(repository = createBookingRepository(), gateway = gatewayClient) {
  return {
    seatMap: async (id) => requireFound(await repository.seatMap(id), 'Showtime not found.'),
    async hold(userId, showtimeId, seatIds) {
      const id = randomUUID(); const seconds = ttl();
      const locks = await acquireSeatLocks(showtimeId, seatIds, id, seconds);
      if (!locks.acquired) throw new BookingError(409, 'SEATS_UNAVAILABLE', 'One or more seats are no longer available.');
      try {
        const hold = await repository.createHold({ id, userId, showtimeId, seatIds, expiresAt: new Date(Date.now() + seconds * 1000) });
        if (!hold) throw new BookingError(409, 'SEATS_UNAVAILABLE', 'One or more seats are no longer available.');
        return hold;
      } catch (error) { await releaseKeys(locks.keys); throw error; }
    },
    async createBooking(userId, holdId) {
      const booking = await repository.createBooking(userId, holdId);
      if (!booking) throw new BookingError(409, 'HOLD_INVALID', 'The hold is missing, expired, or belongs to another user.');
      return booking;
    },
    async sendOtp(userId, bookingId, phone, controlHeaders = {}) {
      const booking = requireFound(await repository.findOwnedBooking(bookingId, userId));
      if (booking.status !== 'PENDING') throw new BookingError(409, 'BOOKING_NOT_PENDING', 'This booking cannot accept an OTP.');
      const ref = `OTP-${booking.bookingRef}`;
      const redis = await connectedRedis();
      await redis.set(`otp:${booking.id}`, JSON.stringify({ ref, phone, verified: false }), { EX: otpTtl() });
      const callbackBase = process.env.PUBLIC_API_URL ?? 'http://localhost:3000';
      try { await gateway.sendOtp(phone, ref, `${callbackBase}/api/webhooks/otp`, controlHeaders); }
      catch (error) { await redis.del(`otp:${booking.id}`); throw error; }
      return { ref, expiresInSeconds: otpTtl() };
    },
    async verifyOtp(userId, bookingId, code) {
      requireFound(await repository.findOwnedBooking(bookingId, userId));
      const redis = await connectedRedis(); const key = `otp:${bookingId}`; const raw = await redis.get(key);
      if (!raw) throw new BookingError(409, 'OTP_EXPIRED', 'Send a new OTP before verifying.');
      const state = JSON.parse(raw); await gateway.verifyOtp(state.ref, code);
      await repository.markOtpVerified(bookingId, userId);
      await redis.set(key, JSON.stringify({ ...state, verified: true }), { EX: otpTtl() });
      return { verified: true };
    },
    async pay(userId, bookingId, controlHeaders = {}) {
      const booking = requireFound(await repository.findOwnedBooking(bookingId, userId));
      if (booking.status !== 'PENDING') throw new BookingError(409, 'BOOKING_NOT_PENDING', 'This booking cannot be paid.');
      if (!booking.otpVerifiedAt) throw new BookingError(409, 'OTP_REQUIRED', 'Verify the OTP before paying.');
      const { payment } = await repository.createPayment(booking);
      if (payment.gatewayPaymentId) return { paymentId: payment.id, gatewayPaymentId: payment.gatewayPaymentId, status: payment.status, pending: true };
      const ownsInitiation = await repository.claimPaymentInitiation(payment.id);
      if (!ownsInitiation) return { paymentId: payment.id, status: payment.status, pending: true };
      const callbackBase = process.env.PUBLIC_API_URL ?? 'http://localhost:3000';
      const gatewayHeaders = { ...controlHeaders, 'Idempotency-Key': booking.bookingRef };
      let response;
      try {
        response = await gateway.charge({
          amount: booking.totalAmountCents / 100, currency: 'BDT', booking_ref: booking.bookingRef,
          callback_url: `${callbackBase}/api/webhooks/gateway`,
        }, gatewayHeaders);
      } catch (error) { await repository.releasePaymentInitiation(payment.id); throw error; }
      if (response.payment_id) await repository.setGatewayPaymentId(payment.id, response.payment_id);
      return { paymentId: payment.id, gatewayPaymentId: response.payment_id, status: response.status ?? 'PENDING', pending: true };
    },
    webhook: (event) => repository.processWebhook(event),
    async refund(userId, bookingId, controlHeaders = {}) {
      const booking = requireFound(await repository.findOwnedBooking(bookingId, userId));
      if (booking.status !== 'CONFIRMED') throw new BookingError(409, 'BOOKING_NOT_REFUNDABLE', 'Only confirmed bookings can be refunded.');
      const payment = await repository.successfulPayment(booking.id);
      if (!payment?.gatewayPaymentId) throw new BookingError(409, 'PAYMENT_NOT_REFUNDABLE', 'No successful gateway payment was found.');
      const response = await gateway.refund(payment.gatewayPaymentId, controlHeaders);
      return { paymentId: payment.id, gatewayPaymentId: payment.gatewayPaymentId, status: response.status ?? 'PENDING' };
    },
    async otpWebhook(event) {
      const ref = event.ref ?? event.booking_ref;
      if (ref) {
        try { const redis = await connectedRedis(); await redis.set(`otp-delivery:${ref}`, JSON.stringify(event), { EX: otpTtl() }); }
        catch { /* Delivery acknowledgement must not be retried because Redis is unavailable. */ }
      }
      return { accepted: true };
    },
    list: (userId) => repository.listBookings(userId),
    details: async (id, userId) => requireFound(await repository.bookingDetails(id, userId)),
  };
}
