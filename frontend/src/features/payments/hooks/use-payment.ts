import { useEffect, useMemo, useRef, useState } from 'react'
import type {
	PaymentFormValues,
	PaymentStep,
	PaymentVerificationStatus,
} from '../types'

const OTP_LENGTH = 6

export function usePayment(onSuccess?: () => void) {
	const [step, setStep] = useState<PaymentStep>('payment')
	const [verificationStatus, setVerificationStatus] =
		useState<PaymentVerificationStatus>('idle')
	const [formValues, setFormValues] = useState<PaymentFormValues>({
		cardholderName: '',
		cardNumber: '',
		expiry: '',
		cvv: '',
	})
	const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
	const verifyTimeoutRef = useRef<number | null>(null)

	const isOtpComplete = useMemo(() => {
		return otpDigits.every((digit) => digit.length === 1)
	}, [otpDigits])

	useEffect(() => {
		if (verificationStatus !== 'success') {
			return
		}

		onSuccess?.()
	}, [onSuccess, verificationStatus])

	useEffect(() => {
		if (!isOtpComplete || verificationStatus !== 'idle') {
			return
		}

		setVerificationStatus('verifying')

		verifyTimeoutRef.current = window.setTimeout(() => {
			setVerificationStatus('success')
		}, 2000)

		return () => {
			if (verifyTimeoutRef.current) {
				window.clearTimeout(verifyTimeoutRef.current)
			}
		}
	}, [isOtpComplete, verificationStatus])

	function updateField<K extends keyof PaymentFormValues>(
		key: K,
		value: PaymentFormValues[K],
	) {
		setFormValues((current) => ({
			...current,
			[key]: value,
		}))
	}

	function submitPayment() {
		setStep('otp')
		setVerificationStatus('idle')
		setOtpDigits(Array(OTP_LENGTH).fill(''))
	}

	function returnToPayment() {
		setStep('payment')
		setVerificationStatus('idle')
		setOtpDigits(Array(OTP_LENGTH).fill(''))
	}

	function updateOtp(index: number, nextValue: string) {
		const sanitized = nextValue.replace(/\D/g, '').slice(0, 1)

		setOtpDigits((current) => {
			const nextDigits = [...current]
			nextDigits[index] = sanitized
			return nextDigits
		})

		if (verificationStatus === 'success') {
			setVerificationStatus('idle')
		}
	}

	function clearOtpAt(index: number) {
		setOtpDigits((current) => {
			const nextDigits = [...current]
			nextDigits[index] = ''
			return nextDigits
		})
	}

	function resendOtp() {
		setVerificationStatus('idle')
		setOtpDigits(Array(OTP_LENGTH).fill(''))
	}

	return {
		step,
		formValues,
		verificationStatus,
		otpDigits,
		updateField,
		submitPayment,
		returnToPayment,
		updateOtp,
		clearOtpAt,
		resendOtp,
	}
}

