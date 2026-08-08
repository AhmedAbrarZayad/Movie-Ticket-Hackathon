import { apiClient } from '../../../lib/api/client'
import type { Movie } from '../../../types/movie'

export async function getMovieDetails(movieId: string) {
  const { data } = await apiClient.get<{ success: boolean; data: Movie }>(`/catalogue/movies/${movieId}`)
  return data.data
}

