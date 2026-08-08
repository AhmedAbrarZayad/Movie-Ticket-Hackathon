import { formatBDT } from '../../../lib/utils/currency'
import type { Movie } from '../../../types/movie'
import type { Seat } from '../types'

interface Props {
  movie: Movie; selectedSeats: Seat[]; ticketPriceCents: number; totalAmountCents: number
  theatreName: string; screenName: string; startsAt: string; isSubmitting?: boolean
  error?: string | null; onProceed: () => void
}

export function SeatSummary({ movie, selectedSeats, ticketPriceCents, totalAmountCents, theatreName, screenName, startsAt, isSubmitting, error, onProceed }: Props) {
  return (
    <aside className="z-10 flex w-full flex-col border-l border-white/5 bg-[var(--surface-low)] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] lg:sticky lg:top-0 lg:h-screen lg:w-[400px]">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mb-8 flex gap-4 rounded-xl border border-white/5 bg-[var(--surface-high)]/40 p-4">
          <img alt={`${movie.title} poster`} className="h-28 w-20 rounded-lg object-cover" src={movie.posterUrl ?? undefined} />
          <div><h2 className="text-2xl font-semibold">{movie.title}</h2><p className="text-sm text-[var(--muted)]">{theatreName} • {screenName}</p><p className="text-sm text-[var(--muted)]">{new Date(startsAt).toLocaleString('en-BD')}</p></div>
        </div>
        <h3 className="mb-3 text-xs tracking-wider text-[var(--muted)] uppercase">Selected seats</h3>
        <div className="mb-8 flex flex-wrap gap-2">
          {selectedSeats.length === 0 && <span className="text-[var(--muted)]">Select up to eight seats</span>}
          {selectedSeats.map((seat) => <span key={seat.id} className="rounded-lg border border-[var(--primary-container)] px-4 py-2 text-[var(--primary)]">{seat.label}</span>)}
        </div>
        <div className="space-y-4 border-t border-white/10 pt-5">
          <div className="flex justify-between"><span>{selectedSeats.length} × {formatBDT(ticketPriceCents)}</span><span>{formatBDT(totalAmountCents)}</span></div>
          <div className="flex justify-between text-xl font-semibold"><span>Total</span><span className="text-[var(--primary)]">{formatBDT(totalAmountCents)}</span></div>
        </div>
      </div>
      <div className="border-t border-white/5 p-8">
        {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
        <button className="flex w-full justify-center rounded-xl bg-[var(--primary-container)] py-4 disabled:opacity-50" disabled={!selectedSeats.length || isSubmitting} onClick={onProceed} type="button">
          {isSubmitting ? 'Reserving seats…' : 'Reserve seats and continue'}
        </button>
      </div>
    </aside>
  )
}
