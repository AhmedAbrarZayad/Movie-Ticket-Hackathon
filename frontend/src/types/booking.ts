export type SeatStatus = 'available' | 'selected' | 'held' | 'booked'

export interface Seat {
	id: string
	row: string
	number: number
	status: SeatStatus
}

export interface SeatRow {
	row: string
	seats: Seat[]
}

export interface BookingBreakdown {
	ticketPrice: number
	fees: number
}

