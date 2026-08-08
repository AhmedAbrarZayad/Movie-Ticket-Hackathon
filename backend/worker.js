import 'dotenv/config';
import { Queue, Worker } from 'bullmq';
import { createBookingRepository } from './src/booking/booking.repository.js';
import { createBookingService } from './src/booking/booking.service.js';
import { bullConnection } from './src/booking/booking.queue.js';

const connection = bullConnection();
const queue = new Queue('booking-maintenance', { connection });
const interval = Math.max(1000, Number(process.env.HOLD_SWEEP_INTERVAL_MS ?? 5000));
await queue.upsertJobScheduler('expire-holds', { every: interval }, { name: 'expire-holds' });
const repository = createBookingRepository();
const service = createBookingService(repository);
const worker = new Worker('booking-maintenance', async (job) => {
  if (job.name === 'expire-holds') return repository.expireHolds();
  if (job.name === 'gateway-webhook') return service.webhook(job.data);
  if (job.name === 'otp-webhook') return service.otpWebhook(job.data);
}, { connection });
worker.on('failed', (job, error) => console.error(`Worker job ${job?.id} failed:`, error.message));
console.log(`Booking worker running; sweep interval ${interval}ms.`);
