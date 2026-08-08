import { apiClient } from '../../../lib/api/client'

export async function startPayment(bookingId: string) {
  const response = await apiClient.post<{ success: true; data: { paymentId: string; status: string; pending: boolean } }>(`/bookings/${bookingId}/pay`)
  return response.data.data
}

