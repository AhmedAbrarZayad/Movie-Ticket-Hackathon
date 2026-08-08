import type { Movie } from '../../../types/movie'
import { MovieCard } from './movie-card'

interface MovieListProps {
  movies: Movie[]
}

export function MovieList({ movies }: MovieListProps) {
  if (movies.length === 0) {
    return (
      <div className="glass-panel rounded-xl border border-white/10 p-8 text-center text-[var(--muted)]">
        No movies match your current filters.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}
