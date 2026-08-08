import type { Movie } from '../../../types/movie'
import type { Seat } from '../types'

interface SeatSummaryProps {
  movie: Movie
  selectedSeats: Seat[]
  ticketPrice: number
  fees: number
  total: number
  heldTime: string
  onProceed: () => void
}

export function SeatSummary({
  movie,
  selectedSeats,
  ticketPrice,
  fees,
  total,
  heldTime,
  onProceed,
}: SeatSummaryProps) {
  return (
    <aside className="z-10 flex h-full w-full flex-col border-l border-white/5 bg-[var(--surface-low)] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] lg:sticky lg:top-0 lg:h-screen lg:w-[400px]">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mb-8 hidden w-fit cursor-pointer items-center gap-4 text-[var(--muted)] transition-colors hover:text-[var(--primary)] md:flex">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-xs tracking-wider uppercase">Change Show</span>
        </div>

        <div className="mb-8 flex gap-4 rounded-xl border border-white/5 bg-[var(--surface-high)]/40 p-4 backdrop-blur-xl">
          <img
            alt={`${movie.title} poster`}
            className="h-28 w-20 rounded-lg border border-white/10 object-cover shadow-md"
            src={movie.posterUrl ?? undefined}
          />
          <div className="flex flex-col justify-center">
            <h2 className="mb-1 text-2xl font-semibold text-[var(--text-title)]">{movie.title}</h2>
            <p className="mb-2 text-xs text-[var(--muted)]">Hall #04 • IMAX 3D</p>
            <div className="flex gap-2">
              <span className="rounded border border-white/10 bg-[var(--surface-highest)] px-2 py-1 text-[10px] uppercase">
                PG-13
              </span>
              <span className="rounded border border-white/10 bg-[var(--surface-highest)] px-2 py-1 text-[10px] uppercase">
                {movie.genres[0] ?? 'Action'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-xs tracking-wider text-[var(--muted)] uppercase">Selected Seats</h3>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.length === 0 && (
                <div className="rounded-lg border border-dashed border-white/20 px-4 py-2 text-[var(--muted)]">
                  Select seats to continue
                </div>
              )}
              {selectedSeats.map((seat) => (
                <div
                  key={seat.id}
                  className="rounded-lg border border-[var(--primary-container)] bg-[var(--primary-container)]/10 px-4 py-2 font-semibold text-[var(--primary)]"
                >
                  {seat.id}
                </div>
              ))}
            </div>
          </div>

          <hr className="border-white/5" />

          <div className="flex items-center justify-between">
            <h3 className="text-xs tracking-wider text-[var(--muted)] uppercase">
              Tickets ({selectedSeats.length})
            </h3>
            <span>${(selectedSeats.length * ticketPrice).toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-xs tracking-wider text-[var(--muted)] uppercase">Fees & Taxes</h3>
            <span>${fees.toFixed(2)}</span>
          </div>

          <hr className="border-white/5" />

          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[var(--surface-container)]/50 p-4">
            <h3 className="text-xl font-semibold text-[var(--text-title)]">Total</h3>
            <span className="text-2xl font-semibold text-[var(--primary)]">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 bg-[var(--surface-high)] p-8">
        <div className="mb-4 flex items-center justify-center gap-2 text-[var(--muted)]">
          <span className="material-symbols-outlined text-[18px]">timer</span>
          <span className="text-xs tracking-wider">
            SEATS HELD FOR <strong className="font-bold text-[var(--primary)]">{heldTime}</strong>
          </span>
        </div>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary-container)] py-4 text-[var(--text-title)] transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={selectedSeats.length === 0}
          onClick={onProceed}
          type="button"
        >
          Proceed to Payment
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </aside>
  )
}
