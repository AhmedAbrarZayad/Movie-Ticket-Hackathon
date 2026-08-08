import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SeatMap } from '../../features/booking/components/seat-map'
import { SeatSummary } from '../../features/booking/components/seat-summary'
import { useSeatAvailability } from '../../features/booking/hooks/use-seat-availability'
import { routes } from '../../config/routes'
import { movies } from '../../features/movies'

export function BookingRoute() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const booking = useSeatAvailability()

  const selectedMovie = useMemo(() => {
    return movies.find((movie) => movie.id === movieId) ?? movies[0]
  }, [movieId])

  function handleProceedToPayment() {
    navigate(routes.payment.replace(':movieId', selectedMovie.id), {
      state: {
        seats: booking.selectedSeats.map((seat) => seat.id),
        total: booking.total,
      },
    })
  }

  return (
    <main className="cinema-bg min-h-screen overflow-x-hidden pt-16 md:pt-0">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center border-b border-white/10 bg-[var(--surface)]/80 p-4 shadow-sm backdrop-blur-xl md:hidden">
        <button className="mr-4 text-[var(--text)] transition-colors hover:text-[var(--primary)]" type="button">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="text-2xl font-bold tracking-tight text-[var(--primary-container)]">CinemaSeat</span>
      </header>

      <div className="flex flex-col lg:flex-row">
        <SeatMap rows={booking.rows} onSeatClick={booking.toggleSeat} />
        <SeatSummary
          movie={selectedMovie}
          selectedSeats={booking.selectedSeats}
          ticketPrice={booking.ticketPrice}
          fees={booking.fees}
          total={booking.total}
          heldTime={booking.heldTime}
          onProceed={handleProceedToPayment}
        />
      </div>
    </main>
  )
}
