import { apiClient } from '../../../lib/api/client'
import type { BookingDetails } from '../../../types/booking'

export async function createBooking(holdId: string) {
  const response = await apiClient.post<{ success: true; data: BookingDetails }>('/bookings', { holdId })
  return response.data.data
}

export async function getBooking(bookingId: string) {
  const response = await apiClient.get<{ success: true; data: BookingDetails }>(`/bookings/${bookingId}`)
  return response.data.data
}

