import { createBookingService } from './booking.service.js';
import { bookingSchema, holdSchema, otpSendSchema, otpVerifySchema, validate } from './booking.validation.js';
import { verifyGatewaySignature } from './gateway.signature.js';
import { enqueueGatewayWebhook, enqueueOtpWebhook } from './booking.queue.js';

function mockHeaders(request) {
  const headers = {};
  if (request.get('X-Mock-Mode')) headers['X-Mock-Mode'] = request.get('X-Mock-Mode');
  if (request.get('X-Mock-Force')) headers['X-Mock-Force'] = request.get('X-Mock-Force');
  return headers;
}

export function createBookingController(service = createBookingService()) {
  return {
    seatMap: async (req, res) => res.json({ success: true, data: await service.seatMap(req.params.showtimeId) }),
    hold: async (req, res) => res.status(201).json({ success: true, data: await service.hold(req.userId, req.params.showtimeId, validate(holdSchema, req.body).seatIds) }),
    create: async (req, res) => res.status(201).json({ success: true, data: await service.createBooking(req.userId, validate(bookingSchema, req.body).holdId) }),
    sendOtp: async (req, res) => res.status(202).json({ success: true, data: await service.sendOtp(req.userId, req.params.bookingId, validate(otpSendSchema, req.body).phone, mockHeaders(req)) }),
    verifyOtp: async (req, res) => res.json({ success: true, data: await service.verifyOtp(req.userId, req.params.bookingId, validate(otpVerifySchema, req.body).code) }),
    pay: async (req, res) => {
      res.status(202).json({ success: true, data: await service.pay(req.userId, req.params.bookingId, mockHeaders(req)) });
    },
    refund: async (req, res) => res.status(202).json({ success: true, data: await service.refund(req.userId, req.params.bookingId, mockHeaders(req)) }),
    webhook: async (req, res) => {
      verifyGatewaySignature(req);
      await enqueueGatewayWebhook(req.body);
      res.status(202).json({ success: true, data: { accepted: true } });
    },
    otpWebhook: async (req, res) => {
      verifyGatewaySignature(req);
      await enqueueOtpWebhook(req.body);
      res.status(202).json({ success: true, data: { accepted: true } });
    },
    list: async (req, res) => res.json({ success: true, data: await service.list(req.userId) }),
    details: async (req, res) => res.json({ success: true, data: await service.details(req.params.bookingId, req.userId) }),
  };
}
