export type MovieStatus = 'now-showing' | 'coming-soon'

export interface Movie {
  id: string
  title: string
  slug: string
  genres: string[]
  rating: number
  posterUrl: string
  trailerUrl?: string
  heroDescription: string
  heroTag: string
  status: MovieStatus
}

export interface PaginationState {
  page: number
  pageSize: number
  totalPages: number
}
