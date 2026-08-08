import { AuthShell } from '../../features/auth/components/auth-shell'
import { LoginForm } from '../../features/auth/components/login-form'

export function LoginRoute() {
  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to your account" description="Pick up where you left off and make your next movie night happen.">
      <LoginForm />
    </AuthShell>
  )
}
