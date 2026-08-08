import { Router } from 'express';
import { createAuthenticationController } from './authentication.controller.js';
import { requireAuthentication } from './authentication.middleware.js';
import { createAuthenticationRepository } from './authentication.repository.js';
import { createAuthenticationService } from './authentication.service.js';
import { loginSchema, registerSchema, validate } from './authentication.validation.js';

const asyncRoute = (handler) => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

export function createAuthenticationRouter(repository = createAuthenticationRepository()) {
  const service = createAuthenticationService(repository);
  const controller = createAuthenticationController(service, repository);
  const router = Router();

  router.post('/register', validate(registerSchema), asyncRoute(controller.register));
  router.post('/login', validate(loginSchema), asyncRoute(controller.login));
  router.post('/refresh', asyncRoute(controller.refresh));
  router.post('/logout', asyncRoute(controller.logout));
  router.get('/me', requireAuthentication, asyncRoute(controller.me));
  return router;
}
