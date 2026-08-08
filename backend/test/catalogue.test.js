import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import request from 'supertest';
import { createCatalogueController } from '../src/catalogue/catalogue.controller.js';
import { CatalogueError } from '../src/catalogue/catalogue.errors.js';
import { createCatalogueRouter, catalogueErrorHandler } from '../src/catalogue/catalogue.routes.js';
import { createCatalogueService } from '../src/catalogue/catalogue.service.js';

function repository() {
  const movie = { id: 'movie-id', title: 'Dune: Part Two' };
  return {
    movie,
    filters: null,
    async findMovies(filters) { this.filters = filters; return [movie]; },
    async findMovie(id) { return ['movie-id', 'dune-part-two'].includes(id) ? movie : null; },
    async findTheatres() { return [{ id: 'theatre-id', name: 'CinemaSeat GEC' }]; },
    async findMovieShowtimes() {
      return [
        { id: 'show-1', theatreId: 't1', theatreName: 'GEC', theatreAddress: 'GEC Circle', screenNumber: 1, screenName: 'IMAX', startsAt: new Date(), endsAt: new Date(), priceCents: 50000, availableSeatCount: 80 },
        { id: 'show-2', theatreId: 't1', theatreName: 'GEC', theatreAddress: 'GEC Circle', screenNumber: 1, screenName: 'IMAX', startsAt: new Date(), endsAt: new Date(), priceCents: 50000, availableSeatCount: 79 },
      ];
    },
  };
}

function appFor(repo) {
  const app = express();
  const service = createCatalogueService(repo);
  app.use('/api/catalogue', createCatalogueRouter(createCatalogueController(service)));
  app.use(catalogueErrorHandler);
  app.use((error, req, res, next) => {
    if (error instanceof CatalogueError) return res.status(error.status).json({ success: false, error: { code: error.code } });
    next(error);
  });
  return app;
}

test('movie endpoint forwards normalized filters', async () => {
  const repo = repository();
  const response = await request(appFor(repo)).get('/api/catalogue/movies?search=%20dune%20&status=now-showing');
  assert.equal(response.status, 200);
  assert.deepEqual(repo.filters, { search: 'dune', status: 'now-showing' });
});

test('invalid filters and missing movies return consistent errors', async () => {
  assert.equal((await request(appFor(repository())).get('/api/catalogue/movies?status=bad')).status, 400);
  const missing = await request(appFor(repository())).get('/api/catalogue/movies/missing');
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error.code, 'MOVIE_NOT_FOUND');
});

test('showtime endpoint validates dates and groups theatre screens', async () => {
  const app = appFor(repository());
  assert.equal((await request(app).get('/api/catalogue/movies/movie-id/showtimes?date=bad')).status, 400);
  const response = await request(app).get('/api/catalogue/movies/movie-id/showtimes?date=2026-08-08');
  assert.equal(response.status, 200);
  assert.equal(response.body.data.theatres.length, 1);
  assert.equal(response.body.data.theatres[0].screens[0].showtimes.length, 2);
});

test('theatre endpoint returns repository theatres', async () => {
  const response = await request(appFor(repository())).get('/api/catalogue/theatres');
  assert.equal(response.status, 200);
  assert.equal(response.body.data[0].name, 'CinemaSeat GEC');
});
