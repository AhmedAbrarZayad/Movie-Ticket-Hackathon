import { useEffect, useRef } from 'react'
import type { PaymentVerificationStatus } from '../types'

interface PaymentStatusProps {
  otpDigits: string[]
  verificationStatus: PaymentVerificationStatus
  phoneMask: string
  onBack: () => void
  onResend: () => void
  onOtpChange: (index: number, value: string) => void
  onOtpBackspace: (index: number) => void
}

export function PaymentStatus({
  otpDigits,
  verificationStatus,
  phoneMask,
  onBack,
  onResend,
  onOtpChange,
  onOtpBackspace,
}: PaymentStatusProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  return (
    <div className="fade-in absolute inset-0 flex flex-col justify-center bg-[var(--surface)]/95 p-8 backdrop-blur-md md:p-12">
      <button
        className="absolute top-8 left-8 flex items-center gap-1 text-xs text-[var(--muted)] transition-colors hover:text-[var(--text)]"
        onClick={onBack}
        type="button"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back
      </button>

      <div className="mt-4 mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[var(--surface-highest)]/50">
          <span className="material-symbols-outlined text-3xl text-[var(--primary)]">lock</span>
        </div>
        <h2 className="mb-2 text-3xl font-semibold text-[var(--text-title)]">Verify Payment</h2>
        <p className="text-[var(--muted)]">
          We sent a code to <span className="font-semibold text-[var(--text)]">{phoneMask}</span>
        </p>
      </div>

      <div className="mb-8 flex justify-center gap-2">
        {otpDigits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element
            }}
            className="otp-input"
            maxLength={1}
            value={digit}
            onChange={(event) => {
              onOtpChange(index, event.target.value)
              if (event.target.value.length > 0) {
                inputRefs.current[index + 1]?.focus()
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && otpDigits[index].length === 0) {
                onOtpBackspace(index)
                inputRefs.current[index - 1]?.focus()
              }
            }}
          />
        ))}
      </div>

      {verificationStatus === 'verifying' && (
        <div className="mb-6 flex items-center justify-center gap-3 text-[var(--primary)]">
          <div className="spinner" />
          Verifying...
        </div>
      )}

      {verificationStatus === 'success' && (
        <div className="mb-6 flex items-center justify-center gap-2 text-green-500">
          <span className="material-symbols-outlined">check_circle</span>
          Payment Successful
        </div>
      )}

      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        Did not receive code?
        <button
          className="ml-1 font-semibold text-[var(--primary)] transition-colors hover:text-[var(--text-title)]"
          onClick={onResend}
          type="button"
        >
          Resend
        </button>
      </p>
    </div>
  )
}

