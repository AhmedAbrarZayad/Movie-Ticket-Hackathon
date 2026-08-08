import { useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { routes } from '../../config/routes'
import { useCreateBooking } from '../../features/booking/hooks/use-create-booking'
import { movies } from '../../features/movies'

interface ConfirmationLocationState {
  seats?: string[]
  total?: number
}

export function BookingConfirmationRoute() {
  const { movieId } = useParams()
  const location = useLocation()
  const state = (location.state as ConfirmationLocationState | null) ?? null

  const selectedMovie = useMemo(() => {
    return movies.find((movie) => movie.id === movieId) ?? movies[0]
  }, [movieId])

  const seats = state?.seats?.length ? state.seats.join(', ') : 'F12'
  const total = state?.total ?? 17.5

  const { bookingReference, confettiPieces } = useCreateBooking()

  return (
    <main className="cinema-bg relative min-h-screen overflow-x-hidden">
      <div className="confetti-container" aria-hidden="true">
        {confettiPieces.map((piece) => (
          <span
            key={piece.id}
            className="confetti"
            style={{
              left: `${piece.left}vw`,
              animationDuration: `${piece.duration}s`,
              animationDelay: `${piece.delay}s`,
              backgroundColor: piece.color,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
            }}
          />
        ))}
      </div>

      <section className="relative z-20 flex min-h-screen items-center justify-center p-5 md:p-16">
        <div className="relative flex w-full max-w-2xl flex-col items-center overflow-hidden rounded-xl border border-white/10 bg-[var(--surface-high)]/90 p-8 text-center shadow-2xl backdrop-blur-[12px] md:p-12">
          <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_40px_rgba(229,9,20,0.05)]" />

          <div className="mb-6 animate-pulse">
            <span className="material-symbols-outlined text-[80px] text-[var(--primary-container)]">
              check_circle
            </span>
          </div>

          <h1 className="mb-2 text-4xl font-bold text-[var(--text-title)] md:text-6xl">Enjoy the Show!</h1>
          <p className="mb-20 text-[var(--muted)]">
            Booking Reference: <span className="font-bold text-[var(--primary)]">#{bookingReference}</span>
          </p>

          <div className="mb-20 grid w-full grid-cols-1 gap-6 text-left md:grid-cols-2">
            <div className="order-last flex items-center justify-center rounded-lg border border-white/5 bg-[var(--surface)] p-4 md:order-first">
              <img
                alt="QR Ticket"
                className="h-48 w-48 rounded-md object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBERbu3zVO9Oip1at6-0ZZqcN4e_G0MZ7PCgaRFbFbHIpFoWxFr3B6hiXRXYF5nCZd2j4wK_RwxBTvSeJCQI2lySpSS6JiG63-Ebhoq4z2iMa8wm_o-6EsK9BUujy5jeGg-IpaHVjC6_U9FkHP6tHSZCI0kLIXQv8l3bMwhx_uIGJxiN8ycEqlny1W-yVsBQYl0kpEbscEfN5x2crqitGzQDAzBSEc10gv3ePae6TLM81EtRY8hWaWyeQ"
              />
            </div>

            <div className="flex flex-col justify-center space-y-4">
              <div>
                <p className="mb-1 text-xs tracking-widest text-[var(--muted)] uppercase">Movie</p>
                <p className="text-lg font-semibold text-[var(--text-title)]">{selectedMovie.title}</p>
              </div>
              <div>
                <p className="mb-1 text-xs tracking-widest text-[var(--muted)] uppercase">Date & Time</p>
                <p>Aug 8, 2026 • 12:00 AM</p>
              </div>
              <div>
                <p className="mb-1 text-xs tracking-widest text-[var(--muted)] uppercase">Theatre & Seats</p>
                <p>
                  CUET Campus Hall • <span className="text-[var(--primary)]">{seats}</span>
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs tracking-widest text-[var(--muted)] uppercase">Paid</p>
                <p className="font-semibold text-[var(--primary)]">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto flex w-full flex-col justify-center gap-4 sm:flex-row">
            <button
              className="flex items-center justify-center gap-2 rounded-lg bg-[var(--primary-container)] px-8 py-4 text-xs tracking-wider text-[var(--text-title)] uppercase transition-transform duration-200 hover:scale-[1.02]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download Ticket
            </button>

            <Link
              className="flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-[var(--surface-highest)] px-8 py-4 text-xs tracking-wider text-[var(--muted)] uppercase transition-colors duration-200 hover:bg-[var(--surface-bright)] hover:text-[var(--text-title)]"
              to={routes.home}
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
