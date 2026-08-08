import { Link } from 'react-router-dom'
import { routes } from '../../config/routes'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
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
        <button className="text-[var(--muted)] transition-colors hover:text-[var(--primary-container)]" type="button" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="h-10 w-10 overflow-hidden rounded-full border border-white/20 transition-colors hover:border-[var(--primary-container)]">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0Kyt-lJYF-bfDZsiUkQYkHFL1odMUz3gECHJYuBc6ybY9ssVUlzMOGEKoI0XfAKhqc2gczCNuRMtwtcv-G9yWawOktVA7bOZ5Lm9MIQGcMIZDjF1qGGtIZ0F4QumvWyfjoZi9uK2Okt9_rlVFuKtKUqiQimpujlqtBMGUYgPHtXQmMtJFpPCyVWjvcOU_Mc7YN1pihaqrQE8du5igRs_m4_6u7hy2AaH_yBtrU-5JUrYmDxdrrqJwXw"
            alt="User profile avatar"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  )
}
