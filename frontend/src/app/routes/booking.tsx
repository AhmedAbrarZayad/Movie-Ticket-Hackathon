import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { routes } from '../../config/routes'
import { createBooking } from '../../features/booking/api/create-booking'
import { holdSeats } from '../../features/booking/api/hold-seats'
import { SeatMap } from '../../features/booking/components/seat-map'
import { SeatSummary } from '../../features/booking/components/seat-summary'
import { useSeatAvailability } from '../../features/booking/hooks/use-seat-availability'
import { useAuth } from '../../features/auth/auth-context'
import { useMovieDetails } from '../../features/movies/hooks/use-movie-details'
import { toApiError } from '../../lib/api/api-error'

export function BookingRoute() {
  const { movieId } = useParams(); const navigate = useNavigate(); const [params] = useSearchParams()
  const showtimeId = params.get('showtimeId'); const details = useMovieDetails(movieId)
  const booking = useSeatAvailability(showtimeId); const auth = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false); const [submitError, setSubmitError] = useState<string | null>(null)

  async function proceed() {
    if (!showtimeId || !movieId) return
    if (!auth.isAuthenticated) { navigate(`${routes.login}?returnTo=${encodeURIComponent(location.pathname + location.search)}`); return }
    setIsSubmitting(true); setSubmitError(null)
    try {
      const hold = await holdSeats(showtimeId, booking.selectedSeats.map((seat) => seat.id))
      const created = await createBooking(hold.id)
      navigate(`${routes.payment.replace(':movieId', movieId)}?bookingId=${created.id}`)
    } catch (error) { setSubmitError(toApiError(error).message); await booking.refresh(true) }
    finally { setIsSubmitting(false) }
  }

  if (details.isLoading || booking.isLoading) return <main className="cinema-bg flex min-h-screen items-center justify-center text-[var(--muted)]">Loading live seat map…</main>
  if (!details.movie || !booking.seatMap) return <main className="cinema-bg flex min-h-screen flex-col items-center justify-center gap-4 text-red-200"><p>{details.error || booking.error || 'Showtime not found.'}</p><button onClick={() => navigate(-1)}>Go back</button></main>
  return <main className="cinema-bg min-h-screen"><div className="flex flex-col lg:flex-row">
    <SeatMap rows={booking.rows} onSeatClick={booking.toggleSeat} />
    <SeatSummary movie={details.movie} selectedSeats={booking.selectedSeats} ticketPriceCents={booking.seatMap.priceCents} totalAmountCents={booking.totalAmountCents} theatreName={booking.seatMap.theatreName} screenName={booking.seatMap.screenName} startsAt={booking.seatMap.startsAt} isSubmitting={isSubmitting} error={submitError} onProceed={() => void proceed()} />
  </div></main>
}
