import { apiClient } from '../../../lib/api/client'

export async function sendBookingOtp(bookingId: string, phone: string) {
  const response = await apiClient.post<{ success: true; data: { ref: string; expiresInSeconds: number } }>(`/bookings/${bookingId}/otp/send`, { phone })
  return response.data.data
}

export async function verifyBookingOtp(bookingId: string, code: string) {
  const response = await apiClient.post<{ success: true; data: { verified: true } }>(`/bookings/${bookingId}/otp/verify`, { code })
  return response.data.data
}

