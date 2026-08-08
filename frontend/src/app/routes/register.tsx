import { AuthShell } from '../../features/auth/components/auth-shell'
import { SignupForm } from '../../features/auth/components/signup-form'

export function RegisterRoute() {
  return (
    <AuthShell eyebrow="Join CinemaSeat" title="Create your account" description="Save your bookings and get from showtime to the perfect seat faster.">
      <SignupForm />
    </AuthShell>
  )
}
