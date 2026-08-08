import { createHmac, timingSafeEqual } from 'node:crypto';
import { BookingError } from './booking.errors.js';

export function verifyGatewaySignature(request) {
  const signature = request.get('X-Signature');
  const secret = process.env.GATEWAY_SECRET ?? 'z2p-2026-secret';
  const rawBody = request.rawBody;
  if (!signature || !Buffer.isBuffer(rawBody)) {
    throw new BookingError(401, 'INVALID_GATEWAY_SIGNATURE', 'The gateway signature is missing or invalid.');
  }
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const supplied = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (supplied.length !== expectedBuffer.length || !timingSafeEqual(supplied, expectedBuffer)) {
    throw new BookingError(401, 'INVALID_GATEWAY_SIGNATURE', 'The gateway signature is missing or invalid.');
  }
}
