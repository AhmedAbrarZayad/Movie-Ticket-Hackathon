import { useMovies } from '../features/movies/hooks/use-movies'
import { useFeaturedMovie } from './use-featured-movie'
import { useMovieSearch } from './use-movie-search'
import { useMovieTabs } from './use-movie-tabs'
import { usePagination } from './use-pagination'

export function useHomeViewModel() {
  const { query, debouncedQuery, setQuery } = useMovieSearch('')
  const { activeTab, setActiveTab } = useMovieTabs('now-showing')

  const catalogue = useMovies({ search: debouncedQuery || undefined, status: activeTab })

  const pagination = usePagination(catalogue.movies, 6)
  const featuredMovie = useFeaturedMovie(catalogue.movies)

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
    isLoading: catalogue.isLoading,
    error: catalogue.error,
    retry: catalogue.retry,
  }
}
