export type MovieStatus = 'now-showing' | 'coming-soon'

export interface Movie {
  id: string
  tmdbId: number
  title: string
  slug: string
  genres: string[]
  rating: number
  posterUrl: string | null
  backdropUrl: string | null
  trailerUrl: string | null
  description: string | null
  durationMinutes: number
  releaseDate: string
  status: MovieStatus
}

export interface PaginationState {
  page: number
  pageSize: number
  totalPages: number
}
