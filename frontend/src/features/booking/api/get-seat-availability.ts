import { apiClient } from '../../../lib/api/client'
import type { ShowtimeSeatMap } from '../../../types/booking'

export async function getSeatAvailability(showtimeId: string) {
  const response = await apiClient.get<{ success: true; data: ShowtimeSeatMap }>(`/showtimes/${showtimeId}/seats`)
  return response.data.data
}

