import { CatalogueError } from './catalogue.errors.js';
import { createCatalogueRepository } from './catalogue.repository.js';

export function createCatalogueService(repository = createCatalogueRepository()) {
  return {
    async getMovies(filters) {
      return repository.findMovies(filters);
    },
    async getMovie(movieId) {
      const movie = await repository.findMovie(movieId);
      if (!movie) throw new CatalogueError(404, 'MOVIE_NOT_FOUND', 'Movie not found.');
      return movie;
    },
    async getTheatres() {
      return repository.findTheatres();
    },
    async getMovieShowtimes(movieId, date) {
      const movie = await repository.findMovie(movieId);
      if (!movie) throw new CatalogueError(404, 'MOVIE_NOT_FOUND', 'Movie not found.');
      const showtimes = await repository.findMovieShowtimes(movie.id, date);
      const groups = [];
      for (const showtime of showtimes) {
        let theatre = groups.find(({ theatreId }) => theatreId === showtime.theatreId);
        if (!theatre) {
          theatre = {
            theatreId: showtime.theatreId,
            theatreName: showtime.theatreName,
            theatreAddress: showtime.theatreAddress,
            screens: [],
          };
          groups.push(theatre);
        }
        let screen = theatre.screens.find(({ screenNumber }) => screenNumber === showtime.screenNumber);
        if (!screen) {
          screen = { screenNumber: showtime.screenNumber, screenName: showtime.screenName, showtimes: [] };
          theatre.screens.push(screen);
        }
        screen.showtimes.push({
          id: showtime.id,
          startsAt: showtime.startsAt,
          endsAt: showtime.endsAt,
          priceCents: showtime.priceCents,
          availableSeatCount: showtime.availableSeatCount,
        });
      }
      return { movieId: movie.id, date, theatres: groups };
    },
  };
}

export const catalogueService = createCatalogueService();
