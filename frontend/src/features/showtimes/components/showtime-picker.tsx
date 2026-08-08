import { formatBDT } from '../../../lib/utils/currency'
import { formatShowtime } from '../../../lib/utils/date'
import type { Showtime } from '../types'

export function ShowtimePicker({ showtimes, selectedId, onSelect }: {
  showtimes: Showtime[]
  selectedId: string | null
  onSelect: (showtime: Showtime) => void
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {showtimes.map((showtime) => (
        <button
          key={showtime.id}
          type="button"
          disabled={showtime.availableSeatCount === 0}
          onClick={() => onSelect(showtime)}
          className={`rounded-xl border px-4 py-3 text-left transition ${selectedId === showtime.id
            ? 'border-[var(--primary)] bg-red-500/15 text-white'
            : 'border-white/10 bg-white/[0.04] text-[var(--muted)] hover:border-white/25 hover:text-white'} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          <span className="block font-semibold">{formatShowtime(showtime.startsAt)}</span>
          <span className="mt-1 block text-xs">{formatBDT(showtime.priceCents)} · {showtime.availableSeatCount} seats</span>
        </button>
      ))}
    </div>
  )
}

