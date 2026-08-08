export type SeatStatus = 'available' | 'selected' | 'held' | 'booked'

export interface Seat {
	id: string
	label: string
	row: string
	number: number
	status: SeatStatus
}

export interface ShowtimeSeatMap {
  id: string
  startsAt: string
  priceCents: number
  screenName: string
  title: string
  theatreName: string
  seats: Array<{ id: string; row: string; col: number; seatLabel: string; seatType: string; status: 'AVAILABLE' | 'HELD' | 'BOOKED' }>
}

export interface SeatHold {
  id: string
  showtimeId: string
  expiresAt: string
  seats: Array<{ id: string; label: string }>
  totalAmountCents: number
}

export interface BookingDetails {
  id: string
  bookingRef: string
  showtimeId: string
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'EXPIRED' | 'REFUNDED'
  totalAmountCents: number
  seatCount: number
  otpVerifiedAt: string | null
  createdAt: string
  seats?: Array<{ seatLabel: string; row: string; col: number; seatType: string }>
  payments?: Array<{ id: string; status: string; amountCents: number }>
}

export interface SeatRow {
	row: string
	seats: Seat[]
}

export interface BookingBreakdown {
	ticketPrice: number
	fees: number
}
