import { apiClient } from '../../../lib/api/client'
import type { MovieShowtimes } from '../types'

export async function getShowtimes(movieId: string, date: string) {
  const { data } = await apiClient.get<{ success: boolean; data: MovieShowtimes }>(
    `/catalogue/movies/${movieId}/showtimes`,
    { params: { date } },
  )
  return data.data
}

