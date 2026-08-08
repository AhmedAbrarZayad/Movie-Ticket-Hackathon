import type { Showtime, TheatreShowtimes } from '../types'
import { ShowtimePicker } from './showtime-picker'

export function CinemaPicker({ theatres, selectedId, onSelect }: {
  theatres: TheatreShowtimes[]
  selectedId: string | null
  onSelect: (showtime: Showtime) => void
}) {
  if (!theatres.length) {
    return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-[var(--muted)]">No showtimes are scheduled for this date.</div>
  }
  return (
    <div className="space-y-5">
      {theatres.map((theatre) => (
        <article key={theatre.theatreId} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
          <h3 className="text-xl font-semibold text-white">{theatre.theatreName}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{theatre.theatreAddress}</p>
          <div className="mt-5 space-y-5">
            {theatre.screens.map((screen) => (
              <div key={screen.screenNumber}>
                <p className="mb-3 text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">{screen.screenName}</p>
                <ShowtimePicker showtimes={screen.showtimes} selectedId={selectedId} onSelect={onSelect} />
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

