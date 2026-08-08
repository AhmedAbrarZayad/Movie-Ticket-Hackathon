import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { routes } from '../../../config/routes'
import { toApiError } from '../../../lib/api/api-error'
import { registerSchema, type RegisterFormValues } from '../../../lib/validators/auth.schema'
import { useAuth } from '../auth-context'
import { FormField } from './form-field'

export function SignupForm() {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async ({ confirmPassword, ...values }) => {
    setSubmitError('')
    try {
      await createAccount(values)
      navigate(routes.home, { replace: true })
    } catch (error) {
      setSubmitError(toApiError(error).message)
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormField label="Full name" autoComplete="name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
      <FormField label="Email address" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
      <FormField label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.password?.message} {...register('password')} />
      <FormField label="Confirm password" type="password" autoComplete="new-password" placeholder="Repeat your password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
      {submitError && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{submitError}</div>}
      <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary-container)] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:bg-[var(--primary-container-hover)] disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting && <span className="spinner" aria-hidden="true" />}
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        Already have an account?{' '}
        <Link to={routes.login} className="font-semibold text-[var(--primary)] hover:underline">Sign in</Link>
      </p>
    </form>
  )
}

