import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { routes } from '../../config/routes'
import { getBooking } from '../../features/booking/api/create-booking'
import { sendBookingOtp, verifyBookingOtp } from '../../features/payments/api/create-payment-intent'
import { startPayment } from '../../features/payments/api/confirm-payment'
import { toApiError } from '../../lib/api/api-error'
import { formatBDT } from '../../lib/utils/currency'
import type { BookingDetails } from '../../types/booking'

export function PaymentRoute() {
  const { movieId = '' } = useParams(); const [params] = useSearchParams(); const navigate = useNavigate()
  const bookingId = params.get('bookingId'); const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [phone, setPhone] = useState('+880'); const [code, setCode] = useState(''); const [step, setStep] = useState<'phone' | 'otp' | 'paying'>('phone')
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (!bookingId) return; getBooking(bookingId).then(setBooking).catch((e) => setError(toApiError(e).message)) }, [bookingId])
  async function sendOtp() { if (!bookingId) return; setBusy(true); setError(null); try { await sendBookingOtp(bookingId, phone); setStep('otp') } catch (e) { setError(toApiError(e).message) } finally { setBusy(false) } }
  async function verifyAndPay() {
    if (!bookingId) return; setBusy(true); setError(null)
    try {
      await verifyBookingOtp(bookingId, code); await startPayment(bookingId); setStep('paying')
      for (let attempt = 0; attempt < 30; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 1000)); const current = await getBooking(bookingId); setBooking(current)
        if (current.status === 'CONFIRMED') { navigate(`${routes.bookingConfirmation.replace(':movieId', movieId)}?bookingId=${bookingId}`, { replace: true }); return }
        if (['FAILED', 'EXPIRED'].includes(current.status)) throw new Error(`Payment ended with status ${current.status}.`)
      }
      throw new Error('Payment is still processing. Refresh this page to check again.')
    } catch (e) { setError(e instanceof Error ? e.message : toApiError(e).message); setStep('otp') }
    finally { setBusy(false) }
  }
  if (!bookingId) return <main className="cinema-bg flex min-h-screen items-center justify-center text-red-200">No booking was selected.</main>
  return <main className="cinema-bg flex min-h-screen items-center justify-center p-5">
    <section className="glass-panel w-full max-w-xl rounded-2xl p-8 md:p-12">
      <p className="mb-2 text-sm uppercase tracking-widest text-[var(--primary)]">Secure checkout</p>
      <h1 className="mb-2 text-3xl font-semibold">Complete your booking</h1>
      {booking && <div className="mb-8 rounded-xl bg-white/5 p-5"><div className="flex justify-between"><span>Reference</span><strong>{booking.bookingRef}</strong></div><div className="mt-2 flex justify-between"><span>Seats</span><span>{booking.seats?.map((s) => s.seatLabel).join(', ') || booking.seatCount}</span></div><div className="mt-2 flex justify-between text-xl"><span>Total</span><strong className="text-[var(--primary)]">{formatBDT(booking.totalAmountCents)}</strong></div></div>}
      {step === 'phone' && <form onSubmit={(e) => { e.preventDefault(); void sendOtp() }}><label className="mb-2 block text-sm" htmlFor="phone">Mobile number</label><input id="phone" className="mb-5 w-full rounded-xl border border-white/10 bg-black/20 p-4" value={phone} onChange={(e) => setPhone(e.target.value)} required /><button disabled={busy} className="w-full rounded-xl bg-[var(--primary-container)] p-4 disabled:opacity-50">{busy ? 'Sending…' : 'Send verification code'}</button></form>}
      {(step === 'otp' || step === 'paying') && <form onSubmit={(e) => { e.preventDefault(); void verifyAndPay() }}><label className="mb-2 block text-sm" htmlFor="otp">Verification code</label><input id="otp" inputMode="numeric" maxLength={6} className="mb-2 w-full rounded-xl border border-white/10 bg-black/20 p-4 text-center text-2xl tracking-[.5em]" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required /><p className="mb-5 text-xs text-[var(--muted)]">Demo gateway code: 123456</p><button disabled={busy || code.length < 4} className="w-full rounded-xl bg-[var(--primary-container)] p-4 disabled:opacity-50">{step === 'paying' ? 'Waiting for gateway…' : busy ? 'Processing…' : 'Verify and pay'}</button></form>}
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-500/10 p-4 text-red-200">{error}</p>}
    </section>
  </main>
}
