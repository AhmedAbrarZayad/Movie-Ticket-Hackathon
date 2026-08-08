import { useEffect, useState } from 'react'
import { toApiError } from '../../../lib/api/api-error'
import { getShowtimes } from '../api/get-showtimes'
import type { MovieShowtimes } from '../types'

export function useShowtimes(movieId: string | undefined, date: string) {
  const [data, setData] = useState<MovieShowtimes | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!movieId) { setIsLoading(false); return }
    let active = true
    setIsLoading(true)
    setError('')
    getShowtimes(movieId, date)
      .then((result) => active && setData(result))
      .catch((reason) => active && setError(toApiError(reason).message))
      .finally(() => active && setIsLoading(false))
    return () => { active = false }
  }, [movieId, date])
  return { data, isLoading, error }
}

