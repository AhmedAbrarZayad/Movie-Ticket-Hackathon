import { Link } from 'react-router-dom'
import { routes } from '../../config/routes'
import { useAuth } from '../../features/auth/auth-context'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const { user, isInitializing, logout } = useAuth()

  return (
    <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/10 bg-[var(--surface)]/80 px-5 shadow-sm backdrop-blur-xl md:px-16">
      <div className="flex items-center gap-8 md:gap-12">
        <Link to={routes.home} className="text-2xl font-bold tracking-tight text-[var(--primary-container)]">
          CinemaSeat
        </Link>
        <nav className="hidden gap-8 md:flex">
          <a className="border-b-2 border-[var(--primary)] pb-1 font-semibold text-[var(--primary)]" href="#">
            Movies
          </a>
          <a className="text-[var(--muted)] transition-colors hover:text-[var(--text)]" href="#">
            Cinemas
          </a>
          <a className="text-[var(--muted)] transition-colors hover:text-[var(--text)]" href="#">
            Promos
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[var(--muted)]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search movies..."
            className="glass-panel w-64 rounded-t-lg border-b border-white/10 bg-[var(--surface-high)] py-2 pr-4 pl-10 text-[var(--text)] outline-none transition-colors focus:border-[var(--primary-container)]"
          />
        </div>
        {!isInitializing && user ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-red-300/30 bg-red-500/10 font-semibold text-[var(--primary)]" aria-hidden="true">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <span className="hidden max-w-28 truncate text-sm text-white md:block">{user.name}</span>
            <button onClick={() => void logout()} className="text-sm text-[var(--muted)] transition hover:text-white" type="button">Logout</button>
          </div>
        ) : !isInitializing ? (
          <div className="flex items-center gap-2">
            <Link to={routes.login} className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:text-white">Sign in</Link>
            <Link to={routes.register} className="rounded-lg bg-[var(--primary-container)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-container-hover)]">Join</Link>
          </div>
        ) : (
          <div className="h-10 w-24 animate-pulse rounded-lg bg-white/5" aria-label="Loading account" />
        )}
      </div>
    </header>
  )
}
