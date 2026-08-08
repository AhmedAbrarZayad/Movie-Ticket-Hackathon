import { Link } from 'react-router-dom'
import { routes } from '../../config/routes'

export function NotFoundRoute() {
  return (
    <main className="cinema-bg flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-[var(--text)]">
      <h1 className="text-4xl font-semibold text-[var(--text-title)]">404</h1>
      <p className="text-[var(--muted)]">The page you requested does not exist.</p>
      <Link className="rounded bg-[var(--primary-container)] px-4 py-2 text-white" to={routes.home}>
        Return Home
      </Link>
    </main>
  )
}
