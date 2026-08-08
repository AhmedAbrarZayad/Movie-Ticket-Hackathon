import { useEffect, useMemo, useState } from 'react'
import type { BookingBreakdown, Seat, SeatRow } from '../types'

const DEFAULT_BREAKDOWN: BookingBreakdown = {
	ticketPrice: 15,
	fees: 2.5,
}

function createRow(row: string, statuses: Seat['status'][]): SeatRow {
	return {
		row,
		seats: statuses.map((status, index) => ({
			id: `${row}${String(index + 1).padStart(2, '0')}`,
			row,
			number: index + 1,
			status,
		})),
	}
}

const INITIAL_ROWS: SeatRow[] = [
	createRow('A', [
		'booked',
		'booked',
		'available',
		'available',
		'available',
		'available',
		'available',
		'available',
		'booked',
		'booked',
	]),
	createRow('B', [
		'available',
		'available',
		'booked',
		'booked',
		'available',
		'available',
		'selected',
		'available',
		'available',
		'available',
	]),
	createRow('C', [
		'available',
		'available',
		'available',
		'available',
		'available',
		'held',
		'held',
		'available',
		'available',
		'booked',
	]),
	createRow('D', [
		'available',
		'booked',
		'booked',
		'available',
		'available',
		'available',
		'available',
		'available',
		'available',
		'available',
	]),
	createRow('E', [
		'booked',
		'booked',
		'booked',
		'booked',
		'booked',
		'booked',
		'available',
		'available',
		'available',
		'available',
	]),
]

export function useSeatAvailability() {
	const [rows, setRows] = useState(INITIAL_ROWS)
	const [remainingSeconds, setRemainingSeconds] = useState(5 * 60 - 1)

	useEffect(() => {
		const timer = window.setInterval(() => {
			setRemainingSeconds((current) => {
				if (current <= 0) {
					return 0
				}
				return current - 1
			})
		}, 1000)

		return () => {
			window.clearInterval(timer)
		}
	}, [])

	const selectedSeats = useMemo(() => {
		return rows.flatMap((row) => row.seats.filter((seat) => seat.status === 'selected'))
	}, [rows])

	const total = useMemo(() => {
		return selectedSeats.length * DEFAULT_BREAKDOWN.ticketPrice + DEFAULT_BREAKDOWN.fees
	}, [selectedSeats.length])

	const heldTime = useMemo(() => {
		const minutes = Math.floor(remainingSeconds / 60)
		const seconds = remainingSeconds % 60
		return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
	}, [remainingSeconds])

	function toggleSeat(seatId: string) {
		setRows((currentRows) =>
			currentRows.map((row) => ({
				...row,
				seats: row.seats.map((seat) => {
					if (seat.id !== seatId) {
						return seat
					}

					if (seat.status === 'booked' || seat.status === 'held') {
						return seat
					}

					return {
						...seat,
						status: seat.status === 'selected' ? 'available' : 'selected',
					}
				}),
			})),
		)
	}

	return {
		rows,
		selectedSeats,
		ticketPrice: DEFAULT_BREAKDOWN.ticketPrice,
		fees: DEFAULT_BREAKDOWN.fees,
		total,
		heldTime,
		toggleSeat,
	}
}

