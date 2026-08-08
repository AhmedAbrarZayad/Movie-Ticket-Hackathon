import { Footer } from '../../components/layout/footer'
import { Header } from '../../components/layout/header'
import { PageContainer } from '../../components/layout/page-container'
import { MovieList } from '../../features/movies/components/movie-list'
import { useHomeViewModel } from '../../hooks/use-home-view-model'

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
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAj60jXPEwz83L7iBWITQ68hX-9wM84XfWwCLZ0dxs_mPS1VsoelS9KOurjjMXXjmf_AFInBP8YT1785wScok50KuZG01Q3F0JNaVldVOiUV1f4BjcRLWMgVu0y9mvViRN1u-pr_dVVbOCAJf4D1naZ3InBbTYosjDUb4AIMH2SO7P3D11zNQWAJvo33yULCcTIqRWQJZSHKelRDbfk7L7floKz_gdp2ClZTypXd0dlmErRh8X7G1pxzQ')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0F]/90 to-transparent" />
          </div>

          <PageContainer className="relative z-10 w-full pb-16">
            <div className="mb-4 flex gap-2">
              <span className="glass-panel rounded-full border border-white/20 px-3 py-1 text-xs tracking-widest uppercase">
                {viewModel.featuredMovie?.heroTag ?? 'Now Showing'}
              </span>
              <span className="glass-panel rounded-full border border-white/20 px-3 py-1 text-xs uppercase">IMAX</span>
            </div>
            <h1 className="mb-4 max-w-4xl text-4xl leading-tight font-bold tracking-tight text-[var(--text-title)] md:text-6xl">
              {viewModel.featuredMovie?.title ?? 'CinemaSeat'}
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-[var(--muted)]">
              {viewModel.featuredMovie?.heroDescription ??
                'Explore the latest blockbusters and reserve your seats in seconds.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-lg bg-[var(--primary-container)] px-8 py-3 text-xs tracking-wider text-white uppercase transition-transform hover:scale-[1.02]" type="button">
                Book Now
              </button>
              <button className="glass-panel flex items-center gap-2 rounded-lg px-8 py-3 text-xs tracking-wider uppercase transition-colors hover:bg-white/10" type="button">
                <span className="material-symbols-outlined">play_arrow</span>
                Trailer
              </button>
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

          <MovieList movies={viewModel.visibleMovies} />

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
