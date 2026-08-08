import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { routes } from '../../config/routes'
import { useMovieDetails } from '../../features/movies/hooks/use-movie-details'
import { CinemaPicker } from '../../features/showtimes/components/cinema-picker'
import { useShowtimes } from '../../features/showtimes/hooks/use-showtimes'
import type { Showtime } from '../../features/showtimes/types'
import { formatReleaseDate, nextSevenDates } from '../../lib/utils/date'

export function MovieDetailsRoute() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const dates = useMemo(() => nextSevenDates(), [])
  const [selectedDate, setSelectedDate] = useState(dates[0].value)
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)
  const details = useMovieDetails(movieId)
  const schedule = useShowtimes(movieId, selectedDate)

  if (details.isLoading) return <main className="cinema-bg flex min-h-screen items-center justify-center text-[var(--muted)]">Loading movie…</main>
  if (details.error || !details.movie) return <main className="cinema-bg flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-white"><p>{details.error || 'Movie not found.'}</p><Link to={routes.home} className="text-[var(--primary)]">Return home</Link></main>
  const movie = details.movie

  function selectDate(date: string) {
    setSelectedDate(date)
    setSelectedShowtime(null)
  }

  function continueToBooking() {
    if (!selectedShowtime) return
    navigate(`${routes.booking.replace(':movieId', movie.id)}?showtimeId=${selectedShowtime.id}`)
  }

  return (
    <main className="cinema-bg min-h-screen text-[var(--text)]">
      <section className="relative min-h-[620px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: movie.backdropUrl ? `url('${movie.backdropUrl}')` : undefined }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/75 to-black/30" />
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end gap-8 px-5 pb-14 md:px-10">
          {movie.posterUrl && <img src={movie.posterUrl} alt={`${movie.title} poster`} className="hidden w-56 rounded-2xl shadow-2xl md:block" />}
          <div className="max-w-3xl">
            <Link to={routes.home} className="mb-8 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"><span className="material-symbols-outlined">arrow_back</span>Movies</Link>
            <div className="mb-4 flex flex-wrap gap-2">{movie.genres.map((genre) => <span key={genre} className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs">{genre}</span>)}</div>
            <h1 className="text-4xl font-bold text-white md:text-6xl">{movie.title}</h1>
            <p className="mt-4 text-sm text-white/65">{movie.durationMinutes} min · {formatReleaseDate(movie.releaseDate)} · ★ {movie.rating.toFixed(1)}</p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75">{movie.description}</p>
            {movie.trailerUrl && <a href={movie.trailerUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm text-white hover:bg-white/10"><span className="material-symbols-outlined">play_arrow</span>Watch trailer</a>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24 md:px-10">
        <h2 className="text-3xl font-semibold text-white">Choose a showtime</h2>
        <div className="my-7 flex gap-3 overflow-x-auto pb-2">{dates.map((date) => <button key={date.value} type="button" onClick={() => selectDate(date.value)} className={`min-w-24 rounded-xl border px-4 py-3 ${selectedDate === date.value ? 'border-[var(--primary)] bg-red-500/15 text-white' : 'border-white/10 text-[var(--muted)]'}`}><span className="block text-xs uppercase">{date.weekday}</span><span className="mt-1 block font-semibold">{date.label}</span></button>)}</div>
        {schedule.isLoading ? <p className="py-10 text-center text-[var(--muted)]">Loading showtimes…</p> : schedule.error ? <p className="rounded-xl border border-red-400/20 p-6 text-red-200">{schedule.error}</p> : <CinemaPicker theatres={schedule.data?.theatres ?? []} selectedId={selectedShowtime?.id ?? null} onSelect={setSelectedShowtime} />}
        <button type="button" disabled={!selectedShowtime} onClick={continueToBooking} className="mt-8 w-full rounded-xl bg-[var(--primary-container)] px-6 py-4 font-semibold text-white transition hover:bg-[var(--primary-container-hover)] disabled:cursor-not-allowed disabled:opacity-40">Continue to seat selection</button>
        <p className="mt-8 text-center text-xs text-white/35">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </section>
    </main>
  )
}
