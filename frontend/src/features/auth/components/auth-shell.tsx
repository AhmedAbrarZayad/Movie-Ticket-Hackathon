import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { routes } from '../../../config/routes'

export function AuthShell({ eyebrow, title, description, children }: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="cinema-bg relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12 text-[var(--text)]">
      <div className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-[28rem] w-[28rem] rounded-full bg-blue-700/15 blur-3xl" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#111116]/90 shadow-2xl shadow-black/50 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden border-r border-white/10 p-10 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(229,9,20,.3),transparent_45%)]" />
          <Link to={routes.home} className="relative text-2xl font-bold tracking-tight text-white">
            Cinema<span className="text-[var(--primary-container)]">Seat</span>
          </Link>
          <div className="relative">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10">
              <span className="material-symbols-outlined text-5xl text-[var(--primary)]">confirmation_number</span>
            </div>
            <h2 className="max-w-sm text-4xl font-bold leading-tight text-white">Your perfect seat is one sign-in away.</h2>
            <p className="mt-5 max-w-sm leading-7 text-[var(--muted)]">Discover films, hold the best seats, and keep every booking together.</p>
          </div>
          <p className="relative text-xs tracking-[0.2em] text-white/35 uppercase">Movies feel better together</p>
        </section>

        <section className="p-6 sm:p-10 lg:p-14">
          <Link to={routes.home} className="mb-10 inline-block text-xl font-bold text-white lg:hidden">
            Cinema<span className="text-[var(--primary-container)]">Seat</span>
          </Link>
          <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-[var(--primary)] uppercase">{eyebrow}</p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 mb-8 text-sm leading-6 text-[var(--muted)]">{description}</p>
          {children}
        </section>
      </div>
    </main>
  )
}
