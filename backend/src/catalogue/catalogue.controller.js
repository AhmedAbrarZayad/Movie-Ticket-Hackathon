import { CatalogueError } from './catalogue.errors.js';
import { createCatalogueService } from './catalogue.service.js';

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(value);
}

export function createCatalogueController(service = createCatalogueService()) {
  return {
    getMovies: async (request, response) => {
      const { search, status } = request.query;
      if (status && !['now-showing', 'coming-soon'].includes(status)) {
        throw new CatalogueError(400, 'INVALID_STATUS', 'Status must be now-showing or coming-soon.');
      }
      const movies = await service.getMovies({
        search: typeof search === 'string' ? search.trim() : undefined,
        status,
      });
      response.json({ success: true, data: movies });
    },
    getMovie: async (request, response) => {
      response.json({ success: true, data: await service.getMovie(request.params.movieId) });
    },
    getTheatres: async (request, response) => {
      response.json({ success: true, data: await service.getTheatres() });
    },
    getMovieShowtimes: async (request, response) => {
      const { date } = request.query;
      if (!isValidDate(date)) throw new CatalogueError(400, 'INVALID_DATE', 'Date must use YYYY-MM-DD format.');
      response.json({
        success: true,
        data: await service.getMovieShowtimes(request.params.movieId, date),
      });
    },
  };
}
