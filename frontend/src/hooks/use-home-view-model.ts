import { useMemo } from 'react'
import { movies } from '../features/movies'
import { useFeaturedMovie } from './use-featured-movie'
import { useMovieSearch } from './use-movie-search'
import { useMovieTabs } from './use-movie-tabs'
import { usePagination } from './use-pagination'

export function useHomeViewModel() {
  const { query, debouncedQuery, setQuery } = useMovieSearch('')
  const { activeTab, setActiveTab } = useMovieTabs('now-showing')

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchesTab = movie.status === activeTab
      const matchesSearch =
        debouncedQuery.length === 0 ||
        movie.title.toLowerCase().includes(debouncedQuery) ||
        movie.genres.join(' ').toLowerCase().includes(debouncedQuery)

      return matchesTab && matchesSearch
    })
  }, [activeTab, debouncedQuery])

  const pagination = usePagination(filteredMovies, 6)
  const featuredMovie = useFeaturedMovie(filteredMovies)

  function handleTabChange(nextTab: 'now-showing' | 'coming-soon') {
    setActiveTab(nextTab)
    pagination.resetPage()
  }

  return {
    query,
    setQuery,
    activeTab,
    setActiveTab: handleTabChange,
    featuredMovie,
    visibleMovies: pagination.pagedItems,
    page: pagination.page,
    totalPages: pagination.totalPages,
    goToPage: pagination.goToPage,
  }
}
