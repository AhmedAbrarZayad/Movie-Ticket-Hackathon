import MockAdapter from 'axios-mock-adapter'
import { afterEach, describe, expect, test } from 'vitest'
import { apiClient } from '../../../lib/api/client'
import { createBooking, getBooking } from './create-booking'
import { getSeatAvailability } from './get-seat-availability'
import { holdSeats } from './hold-seats'
import { sendBookingOtp, verifyBookingOtp } from '../../payments/api/create-payment-intent'
import { startPayment } from '../../payments/api/confirm-payment'

let mock: MockAdapter
afterEach(() => mock?.restore())

describe('booking checkout API', () => {
  test('uses the live seat map, hold, and booking endpoints', async () => {
    mock = new MockAdapter(apiClient)
    mock.onGet('/showtimes/show-1/seats').reply(200, { success: true, data: { id: 'show-1', seats: [] } })
    mock.onPost('/showtimes/show-1/holds', { seatIds: ['seat-1'] }).reply(201, { success: true, data: { id: 'hold-1' } })
    mock.onPost('/bookings', { holdId: 'hold-1' }).reply(201, { success: true, data: { id: 'booking-1' } })
    expect((await getSeatAvailability('show-1')).id).toBe('show-1')
    expect((await holdSeats('show-1', ['seat-1'])).id).toBe('hold-1')
    expect((await createBooking('hold-1')).id).toBe('booking-1')
  })

  test('sends OTP, verifies it, starts payment, and reads final status', async () => {
    mock = new MockAdapter(apiClient)
    mock.onPost('/bookings/booking-1/otp/send').reply(202, { success: true, data: { ref: 'OTP-1', expiresInSeconds: 300 } })
    mock.onPost('/bookings/booking-1/otp/verify').reply(200, { success: true, data: { verified: true } })
    mock.onPost('/bookings/booking-1/pay').reply(202, { success: true, data: { paymentId: 'pay-1', status: 'PENDING', pending: true } })
    mock.onGet('/bookings/booking-1').reply(200, { success: true, data: { id: 'booking-1', status: 'CONFIRMED' } })
    expect((await sendBookingOtp('booking-1', '+8801700000000')).ref).toBe('OTP-1')
    expect((await verifyBookingOtp('booking-1', '123456')).verified).toBe(true)
    expect((await startPayment('booking-1')).pending).toBe(true)
    expect((await getBooking('booking-1')).status).toBe('CONFIRMED')
  })
})
