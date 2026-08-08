import MockAdapter from 'axios-mock-adapter'
import { afterEach, describe, expect, test } from 'vitest'
import { apiClient } from '../../../lib/api/client'
import { getShowtimes } from '../../showtimes/api/get-showtimes'
import { getMovieDetails } from './get-movie-details'
import { getMovies } from './get-movies'

let mock: MockAdapter
afterEach(() => mock?.restore())

describe('catalogue API', () => {
  test('sends movie filters and unwraps the response envelope', async () => {
    mock = new MockAdapter(apiClient)
    mock.onGet('/catalogue/movies').reply((config) => [200, { success: true, data: [{ id: 'm1' }], params: config.params }])
    const movies = await getMovies({ search: 'dune', status: 'now-showing' })
    expect(movies).toEqual([{ id: 'm1' }])
    expect(mock.history.get[0].params).toEqual({ search: 'dune', status: 'now-showing' })
  })

  test('loads movie details and dated showtimes', async () => {
    mock = new MockAdapter(apiClient)
    mock.onGet('/catalogue/movies/m1').reply(200, { success: true, data: { id: 'm1', title: 'Dune' } })
    mock.onGet('/catalogue/movies/m1/showtimes').reply(200, { success: true, data: { movieId: 'm1', date: '2026-08-08', theatres: [] } })
    expect((await getMovieDetails('m1')).title).toBe('Dune')
    expect((await getShowtimes('m1', '2026-08-08')).date).toBe('2026-08-08')
    expect(mock.history.get[1].params).toEqual({ date: '2026-08-08' })
  })
})
