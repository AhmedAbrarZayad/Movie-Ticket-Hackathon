import { useCallback, useEffect, useMemo, useState } from 'react'
import { toApiError } from '../../../lib/api/api-error'
import type { Seat, SeatRow, ShowtimeSeatMap } from '../../../types/booking'
import { getSeatAvailability } from '../api/get-seat-availability'

export function useSeatAvailability(showtimeId: string | null) {
  const [seatMap, setSeatMap] = useState<ShowtimeSeatMap | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (quiet = false) => {
    if (!showtimeId) { setError('Choose a showtime before selecting seats.'); setIsLoading(false); return }
    if (!quiet) setIsLoading(true)
    try {
      const data = await getSeatAvailability(showtimeId)
      setSeatMap(data)
      setSelectedIds((current) => current.filter((id) => data.seats.some((seat) => seat.id === id && seat.status === 'AVAILABLE')))
      setError(null)
    } catch (requestError) { setError(toApiError(requestError).message) }
    finally { if (!quiet) setIsLoading(false) }
  }, [showtimeId])

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => void refresh(true), 5000)
    return () => window.clearInterval(timer)
  }, [refresh])

  const rows = useMemo<SeatRow[]>(() => {
    const grouped = new Map<string, Seat[]>()
    for (const source of seatMap?.seats ?? []) {
      const status = selectedIds.includes(source.id) ? 'selected' : source.status.toLowerCase() as Seat['status']
      const seat: Seat = { id: source.id, label: source.seatLabel, row: source.row, number: source.col, status }
      grouped.set(source.row, [...(grouped.get(source.row) ?? []), seat])
    }
    return [...grouped].map(([row, seats]) => ({ row, seats }))
  }, [seatMap, selectedIds])

  const selectedSeats = useMemo(() => rows.flatMap((row) => row.seats.filter((seat) => seat.status === 'selected')), [rows])
  const totalAmountCents = selectedSeats.length * (seatMap?.priceCents ?? 0)
  function toggleSeat(seatId: string) {
    const seat = seatMap?.seats.find((candidate) => candidate.id === seatId)
    if (!seat || seat.status !== 'AVAILABLE') return
    setSelectedIds((current) => current.includes(seatId) ? current.filter((id) => id !== seatId) : current.length < 8 ? [...current, seatId] : current)
  }
  return { rows, selectedSeats, seatMap, totalAmountCents, isLoading, error, refresh, toggleSeat }
}
