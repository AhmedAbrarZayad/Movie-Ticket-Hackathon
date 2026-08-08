import { useEffect, useMemo, useState } from 'react'

interface ConfettiPiece {
	id: string
	left: number
	duration: number
	delay: number
	color: string
	size: number
}

const COLORS = ['#e50914', '#ffb4aa', '#fff7f6', '#353439']

function createPiece(id: string): ConfettiPiece {
	return {
		id,
		left: Math.random() * 100,
		duration: Math.random() * 3 + 2,
		delay: Math.random() * 1.5,
		color: COLORS[Math.floor(Math.random() * COLORS.length)],
		size: Math.floor(Math.random() * 8) + 6,
	}
}

export function useCreateBooking() {
	const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([])

	const bookingReference = useMemo(() => {
		return `BK-${Math.floor(100000 + Math.random() * 900000)}`
	}, [])

	useEffect(() => {
		const initialPieces = Array.from({ length: 50 }, (_, index) =>
			createPiece(`initial-${index}-${Date.now()}`),
		)
		setConfettiPieces(initialPieces)

		const streamTimer = window.setInterval(() => {
			if (Math.random() <= 0.5) {
				return
			}

			const newPiece = createPiece(`stream-${Date.now()}-${Math.random()}`)

			setConfettiPieces((current) => {
				const next = [...current, newPiece]
				return next.slice(-90)
			})
		}, 300)

		return () => {
			window.clearInterval(streamTimer)
		}
	}, [])

	return {
		bookingReference,
		confettiPieces,
	}
}

