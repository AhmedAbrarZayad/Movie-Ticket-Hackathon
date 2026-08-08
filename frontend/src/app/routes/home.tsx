import { Footer } from '../../components/layout/footer'
import { Header } from '../../components/layout/header'
import { PageContainer } from '../../components/layout/page-container'
import { MovieList } from '../../features/movies/components/movie-list'
import { useHomeViewModel } from '../../hooks/use-home-view-model'
import { routes } from '../../config/routes'

export function HomeRoute() {
  const viewModel = useHomeViewModel()

  return (
    <div className="cinema-bg flex min-h-screen flex-col text-[var(--text)]">
      <Header searchQuery={viewModel.query} onSearchChange={viewModel.setQuery} />

      <main className="flex-grow pt-20">
        <section className="relative mb-20 flex min-h-[500px] h-[716px] w-full items-end">
          <div className="absolute inset-0 z-0">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage: viewModel.featuredMovie?.backdropUrl
                  ? `url('${viewModel.featuredMovie.backdropUrl}')`
                  : 'linear-gradient(135deg, #261014, #111218)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0F]/90 to-transparent" />
          </div>

          <PageContainer className="relative z-10 w-full pb-16">
            <div className="mb-4 flex gap-2">
              <span className="glass-panel rounded-full border border-white/20 px-3 py-1 text-xs tracking-widest uppercase">
                {viewModel.featuredMovie?.status === 'coming-soon' ? 'Coming Soon' : 'Now Showing'}
              </span>
              <span className="glass-panel rounded-full border border-white/20 px-3 py-1 text-xs uppercase">IMAX</span>
            </div>
            <h1 className="mb-4 max-w-4xl text-4xl leading-tight font-bold tracking-tight text-[var(--text-title)] md:text-6xl">
              {viewModel.featuredMovie?.title ?? 'CinemaSeat'}
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-[var(--muted)]">
              {viewModel.featuredMovie?.description ??
                'Explore the latest blockbusters and reserve your seats in seconds.'}
            </p>
            <div className="flex flex-wrap gap-4">
              {viewModel.featuredMovie && <Link to={routes.movieDetails.replace(':movieId', viewModel.featuredMovie.id)} className="rounded-lg bg-[var(--primary-container)] px-8 py-3 text-xs tracking-wider text-white uppercase transition-transform hover:scale-[1.02]">
                View Showtimes
              </Link>}
              {viewModel.featuredMovie?.trailerUrl && <a href={viewModel.featuredMovie.trailerUrl} target="_blank" rel="noreferrer" className="glass-panel flex items-center gap-2 rounded-lg px-8 py-3 text-xs tracking-wider uppercase transition-colors hover:bg-white/10">
                <span className="material-symbols-outlined">play_arrow</span>
                Trailer
              </a>}
            </div>
          </PageContainer>
        </section>

        <PageContainer className="mb-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-white/5 pb-4">
            <h2 className="text-3xl font-semibold text-[var(--text-title)]">Featured Movies</h2>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => viewModel.setActiveTab('now-showing')}
                className={`border-b pb-1 text-xs uppercase ${
                  viewModel.activeTab === 'now-showing'
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                Now Showing
              </button>
              <button
                type="button"
                onClick={() => viewModel.setActiveTab('coming-soon')}
                className={`border-b pb-1 text-xs uppercase ${
                  viewModel.activeTab === 'coming-soon'
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                Coming Soon
              </button>
            </div>
          </div>

          {viewModel.isLoading ? (
            <div className="glass-panel rounded-xl p-12 text-center text-[var(--muted)]">Loading movies…</div>
          ) : viewModel.error ? (
            <div className="glass-panel rounded-xl border border-red-400/20 p-10 text-center">
              <p className="mb-4 text-red-200">{viewModel.error}</p>
              <button type="button" onClick={viewModel.retry} className="rounded-lg bg-[var(--primary-container)] px-5 py-2 text-white">Try again</button>
            </div>
          ) : <MovieList movies={viewModel.visibleMovies} />}

          <div className="mt-12 flex items-center justify-center gap-2">
            {Array.from({ length: viewModel.totalPages }, (_, index) => {
              const pageNumber = index + 1
              const isActive = pageNumber === viewModel.page
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => viewModel.goToPage(pageNumber)}
                  className={`h-10 w-10 rounded-lg text-xs ${
                    isActive
                      ? 'bg-[var(--primary-container)] text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]'
                      : 'glass-panel border border-white/10 text-[var(--muted)] hover:bg-white/10 hover:text-[var(--text)]'
                  }`}
                >
                  {pageNumber}
                </button>
              )
            })}
          </div>
        </PageContainer>
      </main>

      <Footer />
    </div>
  )
}
import { Link } from 'react-router-dom'
