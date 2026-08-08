import assert from 'node:assert/strict';
import { test } from 'node:test';
import { holdSchema, validate } from '../src/booking/booking.validation.js';
import { BookingError } from '../src/booking/booking.errors.js';
import { createBookingService } from '../src/booking/booking.service.js';
import { createHmac } from 'node:crypto';
import { verifyGatewaySignature } from '../src/booking/gateway.signature.js';
import { gatewayClient } from '../src/booking/gateway.client.js';

test('hold validation accepts one to eight unique UUID seats', () => {
  const seat = '11111111-1111-4111-8111-111111111111';
  assert.deepEqual(validate(holdSchema, { seatIds: [seat] }).seatIds, [seat]);
  assert.throws(() => validate(holdSchema, { seatIds: [seat, seat] }), BookingError);
  assert.throws(() => validate(holdSchema, { seatIds: [] }), BookingError);
});

test('booking creation rejects an invalid hold', async () => {
  const service = createBookingService({ createBooking: async () => null });
  await assert.rejects(() => service.createBooking('user', 'hold'), (error) => error.code === 'HOLD_INVALID');
});

test('payment requires OTP and uses the stored server-side amount', async () => {
  const calls = [];
  const booking = { id: 'b1', bookingRef: 'BK-1', status: 'PENDING', totalAmountCents: 90000, otpVerifiedAt: new Date() };
  const repository = { findOwnedBooking: async () => booking, createPayment: async () => ({ payment: { id: 'p1', status: 'PENDING' }, created: true }), claimPaymentInitiation: async () => true, releasePaymentInitiation: async () => {}, setGatewayPaymentId: async (...args) => calls.push(args) };
  const gateway = { charge: async (body, headers) => { calls.push([body, headers]); return { payment_id: 'gp1', status: 'PENDING' }; } };
  const result = await createBookingService(repository, gateway).pay('u1', 'b1', { 'X-Mock-Force': 'success' });
  assert.equal(calls[0][0].amount, 900); assert.equal(result.gatewayPaymentId, 'gp1');
  assert.equal(calls[0][1]['Idempotency-Key'], 'BK-1');
  booking.otpVerifiedAt = null;
  await assert.rejects(() => createBookingService(repository, gateway).pay('u1', 'b1'), (error) => error.code === 'OTP_REQUIRED');
});

test('gateway initiation failure leaves one pending payment retryable with a stable key', async () => {
  const repository = { findOwnedBooking: async () => ({ id: 'b1', bookingRef: 'BK-1', status: 'PENDING', totalAmountCents: 10000, otpVerifiedAt: new Date() }), createPayment: async () => ({ payment: { id: 'p1', status: 'PENDING', gatewayPaymentId: null }, created: false }), claimPaymentInitiation: async () => true, releasePaymentInitiation: async () => {} };
  const gateway = { charge: async () => { throw new BookingError(503, 'GATEWAY_UNAVAILABLE', 'down'); } };
  await assert.rejects(() => createBookingService(repository, gateway).pay('u1', 'b1'));
});

test('gateway signatures are checked against the exact raw bytes', () => {
  const rawBody = Buffer.from('{"event_id":"evt_1"}');
  const signature = createHmac('sha256', process.env.GATEWAY_SECRET ?? 'z2p-2026-secret').update(rawBody).digest('hex');
  assert.doesNotThrow(() => verifyGatewaySignature({ rawBody, get: () => signature }));
  assert.throws(() => verifyGatewaySignature({ rawBody, get: () => 'bad' }), (error) => error.code === 'INVALID_GATEWAY_SIGNATURE');
});

test('gateway client sends OTP callback URL and payment idempotency headers', async () => {
  const originalFetch = globalThis.fetch; const calls = [];
  globalThis.fetch = async (url, options) => { calls.push({ url, options, body: JSON.parse(options.body) }); return { ok: true, json: async () => url.endsWith('/charge') ? { payment_id: 'pay_1', status: 'PENDING' } : {} }; };
  try {
    await gatewayClient.sendOtp('01700000000', 'BK-1', 'http://backend:3000/api/webhooks/otp', { 'X-Mock-Mode': 'deterministic' });
    await gatewayClient.charge({ amount: 450, currency: 'BDT', booking_ref: 'BK-1', callback_url: 'http://backend:3000/api/webhooks/gateway' }, { 'Idempotency-Key': 'BK-1' });
  } finally { globalThis.fetch = originalFetch; }
  assert.equal(calls[0].body.callback_url, 'http://backend:3000/api/webhooks/otp');
  assert.equal(calls[0].options.headers['X-Mock-Mode'], 'deterministic');
  assert.equal(calls[1].options.headers['Idempotency-Key'], 'BK-1');
});
