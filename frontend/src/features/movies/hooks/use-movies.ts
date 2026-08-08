import { useCallback, useEffect, useState } from 'react'
import { toApiError } from '../../../lib/api/api-error'
import type { Movie, MovieStatus } from '../../../types/movie'
import { getMovies } from '../api/get-movies'

export function useMovies(filters: { search?: string; status?: MovieStatus }) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestKey, setRequestKey] = useState(0)
  const retry = useCallback(() => setRequestKey((value) => value + 1), [])

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError('')
    getMovies(filters)
      .then((result) => active && setMovies(result))
      .catch((reason) => active && setError(toApiError(reason).message))
      .finally(() => active && setIsLoading(false))
    return () => { active = false }
  }, [filters.search, filters.status, requestKey])

  return { movies, isLoading, error, retry }
}

