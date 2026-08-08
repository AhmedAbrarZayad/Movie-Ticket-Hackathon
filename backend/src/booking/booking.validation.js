import { z } from 'zod';
import { BookingError } from './booking.errors.js';

const uuid = z.string().uuid();
export const holdSchema = z.object({ seatIds: z.array(uuid).min(1).max(8) }).refine(
  ({ seatIds }) => new Set(seatIds).size === seatIds.length,
  { message: 'Seat IDs must be unique.', path: ['seatIds'] },
);
export const bookingSchema = z.object({ holdId: uuid });
export const otpSendSchema = z.object({ phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/) });
export const otpVerifySchema = z.object({ code: z.string().trim().regex(/^[0-9]{4,8}$/) });

export function validate(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new BookingError(400, 'VALIDATION_ERROR', 'The request is invalid.', result.error.flatten().fieldErrors);
  }
  return result.data;
}
