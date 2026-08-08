interface MoviePosterProps {
  title: string
  posterUrl: string | null
}

export function MoviePoster({ title, posterUrl }: MoviePosterProps) {
  if (!posterUrl) return <div className="flex h-full items-center justify-center bg-[var(--surface-high)] text-[var(--muted)]">Poster unavailable</div>
  return <img className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={posterUrl} alt={`${title} poster`} />
}
