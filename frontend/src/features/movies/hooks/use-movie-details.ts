import { useEffect, useState } from 'react'
import { toApiError } from '../../../lib/api/api-error'
import type { Movie } from '../../../types/movie'
import { getMovieDetails } from '../api/get-movie-details'

export function useMovieDetails(movieId?: string) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!movieId) { setIsLoading(false); setError('Movie not found.'); return }
    let active = true
    setIsLoading(true)
    getMovieDetails(movieId)
      .then((result) => active && setMovie(result))
      .catch((reason) => active && setError(toApiError(reason).message))
      .finally(() => active && setIsLoading(false))
    return () => { active = false }
  }, [movieId])
  return { movie, isLoading, error }
}

