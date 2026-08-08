import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { routes } from '../../config/routes'
import { getBooking } from '../../features/booking/api/create-booking'
import { toApiError } from '../../lib/api/api-error'
import { formatBDT } from '../../lib/utils/currency'
import type { BookingDetails } from '../../types/booking'

export function BookingConfirmationRoute() {
  const [params] = useSearchParams(); const bookingId = params.get('bookingId')
  const [booking, setBooking] = useState<BookingDetails | null>(null); const [error, setError] = useState<string | null>(null)
  useEffect(() => { if (bookingId) getBooking(bookingId).then(setBooking).catch((e) => setError(toApiError(e).message)) }, [bookingId])
  if (error || !bookingId) return <main className="cinema-bg flex min-h-screen items-center justify-center text-red-200">{error || 'Booking reference is missing.'}</main>
  if (!booking) return <main className="cinema-bg flex min-h-screen items-center justify-center">Loading your ticket…</main>
  return <main className="cinema-bg flex min-h-screen items-center justify-center p-5">
    <section className="glass-panel w-full max-w-2xl rounded-2xl p-8 text-center md:p-12">
      <span className="material-symbols-outlined text-[80px] text-green-400">check_circle</span>
      <h1 className="mt-3 text-4xl font-bold">Booking confirmed!</h1>
      <p className="mt-3 text-[var(--muted)]">Keep this reference for entry.</p>
      <div className="my-10 rounded-xl border border-dashed border-white/20 bg-black/20 p-8"><p className="text-xs uppercase tracking-widest text-[var(--muted)]">Booking reference</p><p className="mt-2 text-3xl font-bold text-[var(--primary)]">{booking.bookingRef}</p></div>
      <dl className="grid grid-cols-2 gap-5 text-left"><div><dt className="text-xs uppercase text-[var(--muted)]">Seats</dt><dd>{booking.seats?.map((s) => s.seatLabel).join(', ')}</dd></div><div><dt className="text-xs uppercase text-[var(--muted)]">Paid</dt><dd>{formatBDT(booking.totalAmountCents)}</dd></div><div><dt className="text-xs uppercase text-[var(--muted)]">Status</dt><dd>{booking.status}</dd></div><div><dt className="text-xs uppercase text-[var(--muted)]">Booked</dt><dd>{new Date(booking.createdAt).toLocaleString('en-BD')}</dd></div></dl>
      <Link className="mt-10 inline-flex rounded-xl bg-[var(--primary-container)] px-8 py-4" to={routes.home}>Back to movies</Link>
    </section>
  </main>
}
