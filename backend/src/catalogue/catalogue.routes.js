import { Router } from 'express';
import { createCatalogueController } from './catalogue.controller.js';
import { CatalogueError } from './catalogue.errors.js';

const asyncRoute = (handler) => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

export function createCatalogueRouter(controller = createCatalogueController()) {
  const router = Router();
  router.get('/movies', asyncRoute(controller.getMovies));
  router.get('/movies/:movieId/showtimes', asyncRoute(controller.getMovieShowtimes));
  router.get('/movies/:movieId', asyncRoute(controller.getMovie));
  router.get('/theatres', asyncRoute(controller.getTheatres));
  return router;
}

export const catalogueRouter = createCatalogueRouter();

export function catalogueErrorHandler(error, request, response, next) {
  if (!(error instanceof CatalogueError)) return next(error);
  response.status(error.status).json({
    success: false,
    error: { code: error.code, message: error.message },
  });
}
