import { Queue } from 'bullmq';

export function bullConnection(url = process.env.REDIS_URL ?? 'redis://localhost:6379') {
  const parsed = new URL(url);
  return { host: parsed.hostname, port: Number(parsed.port || 6379), ...(parsed.username && { username: decodeURIComponent(parsed.username) }), ...(parsed.password && { password: decodeURIComponent(parsed.password) }), ...(parsed.protocol === 'rediss:' && { tls: {} }) };
}
let queue;
export function bookingQueue() { queue ??= new Queue('booking-maintenance', { connection: bullConnection() }); return queue; }
export async function enqueueGatewayWebhook(event) {
  await bookingQueue().add('gateway-webhook', event, { jobId: `gateway-${event.event_id}`, attempts: 8, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 1000, removeOnFail: 1000 });
}
export async function enqueueOtpWebhook(event) {
  const id = event.event_id ?? event.ref ?? `${Date.now()}`;
  await bookingQueue().add('otp-webhook', event, { jobId: `otp-${id}`, attempts: 8, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 1000, removeOnFail: 1000 });
}
