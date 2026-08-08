import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { routes } from '../../config/routes'
import { useMovieDetails } from '../../features/movies/hooks/use-movie-details'
import { PaymentForm } from '../../features/payments/components/payment-form'
import { PaymentStatus } from '../../features/payments/components/payment-status'
import { usePayment } from '../../features/payments/hooks/use-payment'

interface PaymentLocationState {
  seats?: string[]
  total?: number
}

export function PaymentRoute() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as PaymentLocationState | null) ?? null

  const details = useMovieDetails(movieId)

  const selectedSeats = state?.seats?.length ? state.seats : ['F12']
  const ticketTotal = state?.total ?? 17.5

  const payment = usePayment(() => {
    window.setTimeout(() => {
      navigate(routes.bookingConfirmation.replace(':movieId', movieId ?? ''), {
        state: {
          seats: selectedSeats,
          total: ticketTotal,
        },
      })
    }, 1000)
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (details.isLoading) return <main className="cinema-bg flex min-h-screen items-center justify-center text-[var(--muted)]">Loading payment…</main>
  if (!details.movie) return <main className="cinema-bg flex min-h-screen items-center justify-center text-red-200">{details.error || 'Movie not found.'}</main>
  const selectedMovie = details.movie

  return (
    <main
      className="cinema-bg relative flex min-h-screen items-center justify-center bg-cover bg-center p-4 md:p-16"
      style={{
        backgroundImage:
          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC3QVUGkFIX_FLNw4P3-wURQAfRp61TDV9Rmi925xmalmGtE0xU5R_tVs4guMk44Le35iH2Cmp_rJQwMhGBXOre6cgf8bc49CWZsinzoF9uA8SEJRwsSSyDkRIpH8Iln4yT89NeSyFQIG9gNlR7_yFZ7jD1cmJZ8aRLX-6JvtUJTp9aWEQYlLk0DqatBvOU1ossv214hmUk-Yd78gclovFHyYSQF6I6ZNqgBhDK2fwlQM9rv9yIoGZLng')",
      }}
    >
      <div className="glass-panel fade-in relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-xl shadow-2xl md:flex-row">
        <section className="relative h-64 w-full md:h-auto md:w-2/5">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-overlay"
            src={selectedMovie.posterUrl ?? undefined}
            alt={`${selectedMovie.title} poster`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] to-transparent md:bg-gradient-to-r md:to-[var(--surface)]/50" />
          <div className="absolute bottom-0 left-0 w-full p-8">
            <div className="mb-4 inline-block rounded-full border border-white/10 bg-[var(--surface)]/50 px-3 py-1 text-xs tracking-wider text-[var(--secondary)] uppercase backdrop-blur-md">
              Booking Summary
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-[var(--text-title)]">{selectedMovie.title}</h2>
            <div className="mb-6 flex items-center gap-4 text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">calendar_today</span>
                Today, 8:30 PM
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">chair</span>
                {selectedSeats.join(', ')}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-[var(--text)]">
              <span>Total</span>
              <span className="text-2xl font-semibold text-[var(--primary)]">${ticketTotal.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <section className="relative w-full bg-[var(--surface-container)]/90 p-8 md:w-3/5 md:p-12">
          <PaymentForm
            amount={ticketTotal}
            formValues={payment.formValues}
            onFieldChange={payment.updateField}
            onSubmit={payment.submitPayment}
          />

          {payment.step === 'otp' && (
            <PaymentStatus
              otpDigits={payment.otpDigits}
              verificationStatus={payment.verificationStatus}
              phoneMask="+880 1XXX-XXXXXX"
              onBack={payment.returnToPayment}
              onResend={payment.resendOtp}
              onOtpChange={payment.updateOtp}
              onOtpBackspace={payment.clearOtpAt}
            />
          )}
        </section>
      </div>
    </main>
  )
}
