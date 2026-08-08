import type { FormEvent } from 'react'
import type { PaymentFormValues } from '../types'

interface PaymentFormProps {
  amount: number
  formValues: PaymentFormValues
  onFieldChange: <K extends keyof PaymentFormValues>(
    key: K,
    value: PaymentFormValues[K],
  ) => void
  onSubmit: () => void
}

export function PaymentForm({
  amount,
  formValues,
  onFieldChange,
  onSubmit,
}: PaymentFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <div className="transition-opacity duration-300">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-[var(--text-title)]">Payment Details</h1>
        <div className="flex gap-2">
          <span className="material-symbols-outlined text-[var(--muted)] opacity-50">credit_card</span>
          <span className="material-symbols-outlined text-[var(--muted)] opacity-50">
            account_balance_wallet
          </span>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-xs tracking-wider text-[var(--muted)] uppercase">
            Cardholder Name
          </label>
          <input
            className="input-ghost w-full"
            placeholder="Peter Parker"
            required
            value={formValues.cardholderName}
            onChange={(event) => onFieldChange('cardholderName', event.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs tracking-wider text-[var(--muted)] uppercase">
            Card Number
          </label>
          <div className="relative">
            <input
              className="input-ghost w-full pr-10"
              placeholder="•••• •••• •••• 4242"
              required
              value={formValues.cardNumber}
              onChange={(event) => onFieldChange('cardNumber', event.target.value)}
            />
            <span className="material-symbols-outlined absolute top-3 right-0 text-[var(--secondary)]">
              credit_score
            </span>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <label className="mb-1 block text-xs tracking-wider text-[var(--muted)] uppercase">
              Expiry
            </label>
            <input
              className="input-ghost w-full"
              placeholder="MM/YY"
              required
              value={formValues.expiry}
              onChange={(event) => onFieldChange('expiry', event.target.value)}
            />
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-xs tracking-wider text-[var(--muted)] uppercase">CVV</label>
            <div className="relative">
              <input
                className="input-ghost w-full"
                placeholder="•••"
                required
                type="password"
                value={formValues.cvv}
                onChange={(event) => onFieldChange('cvv', event.target.value)}
              />
              <span className="material-symbols-outlined absolute top-3 right-0 text-[var(--secondary)]">
                info
              </span>
            </div>
          </div>
        </div>

        <button
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary-container)] py-4 font-semibold text-[var(--text-title)] transition-all duration-200 hover:scale-105 hover:bg-[var(--primary-container-hover)]"
          type="submit"
        >
          Pay ${amount.toFixed(2)}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </form>
    </div>
  )
}

