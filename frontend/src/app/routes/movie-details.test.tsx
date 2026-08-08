import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import { MovieDetailsRoute } from './movie-details'

const mocks = vi.hoisted(() => ({ details: vi.fn(), showtimes: vi.fn() }))
vi.mock('../../features/movies/hooks/use-movie-details', () => ({ useMovieDetails: mocks.details }))
vi.mock('../../features/showtimes/hooks/use-showtimes', () => ({ useShowtimes: mocks.showtimes }))

function BookingLocation() {
  const location = useLocation()
  return <div>booking destination {location.search}</div>
}

beforeEach(() => {
  mocks.details.mockReturnValue({
    isLoading: false,
    error: '',
    movie: {
      id: 'm1', tmdbId: 693134, slug: 'dune-part-two', title: 'Dune: Part Two',
      description: 'Long live the fighters.', posterUrl: 'poster.jpg', backdropUrl: 'backdrop.jpg',
      trailerUrl: 'https://youtube.test', durationMinutes: 167, genres: ['Science Fiction'],
      rating: 8.4, releaseDate: '2024-03-01T00:00:00.000Z', status: 'now-showing',
    },
  })
  mocks.showtimes.mockReturnValue({
    isLoading: false,
    error: '',
    data: {
      movieId: 'm1', date: '2026-08-08', theatres: [{
        theatreId: 't1', theatreName: 'CinemaSeat GEC', theatreAddress: 'GEC Circle',
        screens: [{ screenNumber: 1, screenName: 'IMAX Hall', showtimes: [{
          id: 'show-1', startsAt: '2026-08-08T14:00:00.000Z', endsAt: '2026-08-08T16:47:00.000Z',
          priceCents: 65000, availableSeatCount: 80,
        }] }],
      }],
    },
  })
})

test('renders TMDB details and navigates with the selected showtime', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/movie/m1']}>
      <Routes>
        <Route path="/movie/:movieId" element={<MovieDetailsRoute />} />
        <Route path="/booking/:movieId" element={<BookingLocation />} />
      </Routes>
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { name: 'Dune: Part Two' })).toBeInTheDocument()
  expect(screen.getByText('CinemaSeat GEC')).toBeInTheDocument()
  const continueButton = screen.getByRole('button', { name: 'Continue to seat selection' })
  expect(continueButton).toBeDisabled()
  await user.click(screen.getByRole('button', { name: /8:00 PM/ }))
  expect(continueButton).toBeEnabled()
  await user.click(continueButton)
  expect(screen.getByText('booking destination ?showtimeId=show-1')).toBeInTheDocument()
})

test('renders loading and error states', () => {
  mocks.details.mockReturnValueOnce({ isLoading: true, error: '', movie: null })
  const { unmount } = render(<MemoryRouter><MovieDetailsRoute /></MemoryRouter>)
  expect(screen.getByText('Loading movie…')).toBeInTheDocument()
  unmount()
  mocks.details.mockReturnValueOnce({ isLoading: false, error: 'Movie not found.', movie: null })
  render(<MemoryRouter><MovieDetailsRoute /></MemoryRouter>)
  expect(screen.getByText('Movie not found.')).toBeInTheDocument()
})
