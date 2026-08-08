export interface PaymentFormValues {
	cardholderName: string
	cardNumber: string
	expiry: string
	cvv: string
}

export type PaymentStep = 'payment' | 'otp'

export type PaymentVerificationStatus = 'idle' | 'verifying' | 'success'

