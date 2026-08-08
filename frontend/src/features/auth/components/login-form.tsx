import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { routes } from '../../../config/routes'
import { toApiError } from '../../../lib/api/api-error'
import { loginSchema, type LoginFormValues } from '../../../lib/validators/auth.schema'
import { useAuth } from '../auth-context'
import { FormField } from './form-field'

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('')
    try {
      await login(values)
      navigate(routes.home, { replace: true })
    } catch (error) {
      setSubmitError(toApiError(error).message)
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormField label="Email address" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
      <FormField label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" error={errors.password?.message} {...register('password')} />
      {submitError && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{submitError}</div>}
      <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary-container)] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:bg-[var(--primary-container-hover)] disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting && <span className="spinner" aria-hidden="true" />}
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        New to CinemaSeat?{' '}
        <Link to={routes.register} className="font-semibold text-[var(--primary)] hover:underline">Create an account</Link>
      </p>
    </form>
  )
}

