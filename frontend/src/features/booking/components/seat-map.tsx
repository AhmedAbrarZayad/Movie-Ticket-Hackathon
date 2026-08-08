import type { SeatRow } from '../types'

interface SeatMapProps {
  rows: SeatRow[]
  onSeatClick: (seatId: string) => void
}

export function SeatMap({ rows, onSeatClick }: SeatMapProps) {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-5 md:p-16">
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[512px] w-3/4 -translate-x-1/2 rounded-full bg-[#a7c8ff]/5 blur-[120px]" />

      <div className="w-full max-w-4xl">
        <div className="screen-curve shadow-[0_-20px_40px_rgba(255,255,255,0.05)]" />

        <div className="mb-12 flex flex-col items-center gap-2 overflow-x-auto pb-4">
          {rows.map((row) => (
            <div className="flex items-center gap-4" key={row.row}>
              <span className="w-4 text-right text-xs text-[var(--muted)]">{row.row}</span>
              <div className="flex gap-1">
                {row.seats.map((seat, index) => (
                  <button
                    key={seat.id}
                    type="button"
                    aria-label={`Seat ${seat.id}`}
                    onClick={() => onSeatClick(seat.id)}
                    className={`seat ${seat.status} ${index === 4 ? 'mr-8' : ''}`}
                  />
                ))}
              </div>
              <span className="w-4 text-xs text-[var(--muted)]">{row.row}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-6 rounded-xl border border-white/5 bg-[var(--surface-high)]/50 p-4 backdrop-blur-md">
          <LegendItem title="Available" sampleClass="border-2 border-[var(--secondary-container)] bg-transparent" />
          <LegendItem title="Selected" sampleClass="border-2 border-[var(--primary-container)] bg-[var(--primary-container)]" />
          <LegendItem title="Held" sampleClass="border-2 border-[var(--primary-container)] bg-[var(--primary-container)] opacity-80 animate-pulse" />
          <LegendItem
            title="Sold"
            sampleClass="border-2 border-[var(--surface-highest)] bg-[repeating-linear-gradient(45deg,#1f1f23,#1f1f23_3px,#2a292e_3px,#2a292e_6px)]"
          />
        </div>
      </div>
    </section>
  )
}

interface LegendItemProps {
  title: string
  sampleClass: string
}

function LegendItem({ title, sampleClass }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-6 w-6 rounded-md ${sampleClass}`} />
      <span className="text-xs tracking-wider text-[var(--muted)] uppercase">{title}</span>
    </div>
  )
}

