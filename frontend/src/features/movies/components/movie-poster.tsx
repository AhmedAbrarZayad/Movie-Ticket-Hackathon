interface MoviePosterProps {
  title: string
  posterUrl: string
}

export function MoviePoster({ title, posterUrl }: MoviePosterProps) {
  return <img className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={posterUrl} alt={`${title} poster`} />
}
