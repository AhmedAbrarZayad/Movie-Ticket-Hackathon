import { BookingError } from './booking.errors.js';

const baseUrl = () => process.env.GATEWAY_URL ?? 'http://localhost:9000';

async function gatewayRequest(path, body, headers = {}, timeoutMs = 5000) {
  let response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new BookingError(503, 'GATEWAY_UNAVAILABLE', 'The payment gateway is temporarily unavailable.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new BookingError(response.status === 400 ? 400 : 502, 'GATEWAY_ERROR', data.message ?? 'The gateway rejected the request.');
  return data;
}

export const gatewayClient = {
  sendOtp: (phone, ref, callbackUrl, headers = {}) => gatewayRequest('/otp/send', { phone, ref, callback_url: callbackUrl }, headers),
  verifyOtp: (ref, code) => gatewayRequest('/otp/verify', { ref, code }),
  charge: (payload, headers) => gatewayRequest('/charge', payload, headers, 5_000),
  refund: (paymentId, headers = {}) => gatewayRequest('/refund', { payment_id: paymentId }, headers, 5_000),
};
