import { useState, type InputHTMLAttributes } from 'react'

export function FormField({ label, error, type = 'text', ...props }: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/85">{label}</span>
      <span className="relative block">
        <input
          {...props}
          type={inputType}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-xl border bg-white/[0.045] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:bg-white/[0.065] ${
            error ? 'border-red-400/80 focus:border-red-400' : 'border-white/10 focus:border-[var(--primary)]'
          } ${isPassword ? 'pr-12' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-white/40 transition hover:text-white"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
          </button>
        )}
      </span>
      {error && <span className="mt-1.5 block text-xs text-red-300">{error}</span>}
    </label>
  )
}
