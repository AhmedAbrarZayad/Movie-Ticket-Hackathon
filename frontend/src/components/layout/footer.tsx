export function Footer() {
  return (
    <footer className="mt-auto flex w-full flex-col items-center justify-between gap-6 border-t border-white/5 bg-[var(--surface-lowest)] px-5 py-12 text-xs text-[var(--secondary)] md:flex-row md:px-16">
      <div className="text-2xl font-semibold text-[var(--primary)]">CinemaSeat</div>
      <nav className="flex flex-wrap items-center justify-center gap-6">
        <a className="text-[var(--muted)] transition-colors hover:text-[var(--primary)]" href="#">
          Support
        </a>
        <a className="text-[var(--muted)] transition-colors hover:text-[var(--primary)]" href="#">
          Privacy Policy
        </a>
        <a className="text-[var(--muted)] transition-colors hover:text-[var(--primary)]" href="#">
          Terms of Service
        </a>
        <a className="text-[var(--muted)] transition-colors hover:text-[var(--primary)]" href="#">
          Careers
        </a>
      </nav>
      <div className="text-[var(--muted)]">© 2026 CinemaSeat. All rights reserved.</div>
    </footer>
  )
}
