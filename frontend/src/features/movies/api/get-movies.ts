import { apiClient } from '../../../lib/api/client'
import type { Movie, MovieStatus } from '../../../types/movie'

interface ApiResponse<T> { success: boolean; data: T }

export async function getMovies(filters: { search?: string; status?: MovieStatus } = {}) {
  const { data } = await apiClient.get<ApiResponse<Movie[]>>('/catalogue/movies', { params: filters })
  return data.data
}

