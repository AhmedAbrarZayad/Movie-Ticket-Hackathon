import { Link, useParams } from 'react-router-dom'
import { routes } from '../../config/routes'

export function MovieDetailsRoute() {
  const { movieId } = useParams()

  return (
    <main className="cinema-bg flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-[var(--text)]">
      <h1 className="text-3xl font-semibold text-[var(--text-title)]">Movie Details</h1>
      <p className="text-[var(--muted)]">Placeholder route for: {movieId}</p>
      <Link className="rounded bg-[var(--primary-container)] px-4 py-2 text-white" to={routes.home}>
        Back to Home
      </Link>
    </main>
  )
}
