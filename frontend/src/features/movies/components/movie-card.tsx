import { Link } from 'react-router-dom'
import type { Movie } from '../../../types/movie'
import { routes } from '../../../config/routes'
import { MoviePoster } from './movie-poster'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="glass-panel group relative flex h-[500px] cursor-pointer flex-col overflow-hidden rounded-xl transition-colors hover:border-[var(--primary-container)]/50">
      <div className="absolute inset-0 z-0 h-[80%]">
        <MoviePoster title={movie.title} posterUrl={movie.posterUrl} />
        <div className="movie-card-overlay absolute inset-0" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-end bg-gradient-to-t from-[var(--surface-high)] via-[var(--surface-high)]/90 to-transparent p-6">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h4 className="text-2xl leading-tight font-semibold text-[var(--text-title)]">{movie.title}</h4>
          <div className="flex items-center gap-1 rounded bg-[var(--surface-highest)] px-2 py-1">
            <span className="material-symbols-outlined text-base text-[var(--primary)]">star</span>
            <span className="text-xs text-[var(--text)]">{movie.rating.toFixed(1)}</span>
          </div>
        </div>

        <p className="mb-4 line-clamp-2 text-[var(--muted)]">{movie.genres.join(', ')}</p>

        <Link
          to={routes.booking.replace(':movieId', movie.id)}
          className="w-full translate-y-4 rounded-lg border border-white/10 bg-[var(--surface-bright)] py-3 text-center text-xs tracking-wider text-[var(--text)] uppercase opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:border-transparent group-hover:bg-[var(--primary-container)] group-hover:text-white group-hover:opacity-100"
        >
          Book Now
        </Link>
      </div>
    </article>
  )
}
