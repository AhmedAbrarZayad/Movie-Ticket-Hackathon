import { useEffect, useState } from 'react'

export function useMovieSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase())
    }, 250)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [query])

  return {
    query,
    debouncedQuery,
    setQuery,
  }
}
