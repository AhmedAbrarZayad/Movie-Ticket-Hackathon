import { useMemo } from 'react'
import type { Movie } from '../types/movie'

export function useFeaturedMovie(movies: Movie[]) {
  return useMemo(() => {
    return movies[0] ?? null
  }, [movies])
}
