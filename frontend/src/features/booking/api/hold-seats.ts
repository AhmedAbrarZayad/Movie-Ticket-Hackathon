import { apiClient } from '../../../lib/api/client'
import type { SeatHold } from '../../../types/booking'

export async function holdSeats(showtimeId: string, seatIds: string[]) {
  const response = await apiClient.post<{ success: true; data: SeatHold }>(`/showtimes/${showtimeId}/holds`, { seatIds })
  return response.data.data
}

