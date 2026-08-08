import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import cookieParser from 'cookie-parser';
import express from 'express';
import request from 'supertest';
import { createAuthenticationRouter } from '../src/authentication/authentication.routes.js';
import { AuthenticationError } from '../src/authentication/authentication.errors.js';

before(() => {
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-that-is-at-least-thirty-two-characters';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-that-is-at-least-thirty-two-characters';
  process.env.NODE_ENV = 'test';
});

function createMemoryRepository() {
  const users = new Map();
  const sessions = new Map();
  let userSequence = 0;

  return {
    users,
    sessions,
    async findUserByEmail(email) {
      return [...users.values()].find((user) => user.email === email) ?? null;
    },
    async findPublicUserById(id) {
      const user = users.get(id);
      return user ? { id: user.id, email: user.email, name: user.name } : null;
    },
    async createUser(input) {
      const user = { id: `00000000-0000-4000-8000-${String(++userSequence).padStart(12, '0')}`, ...input };
      users.set(user.id, user);
      return { id: user.id, email: user.email, name: user.name };
    },
    async createRefreshSession(session) {
      sessions.set(session.id, { ...session, revokedAt: null });
    },
    async findRefreshSession(id) {
      return sessions.get(id) ?? null;
    },
    async rotateRefreshSession({ id, previousTokenHash, tokenHash, expiresAt }) {
      const session = sessions.get(id);
      if (!session || session.revokedAt || session.tokenHash !== previousTokenHash) return false;
      sessions.set(id, { ...session, tokenHash, expiresAt });
      return true;
    },
    async revokeRefreshSession(id) {
      const session = sessions.get(id);
      if (session) sessions.set(id, { ...session, revokedAt: new Date() });
    },
  };
}

function createTestApp(repository) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', createAuthenticationRouter(repository));
  app.use((error, req, res, next) => {
    if (error instanceof AuthenticationError) {
      res.status(error.status).json({ error: { code: error.code, message: error.message } });
      return;
    }
    next(error);
  });
  return app;
}

test('registration hashes the password, returns tokens, and authenticates /me', async () => {
  const repository = createMemoryRepository();
  const app = createTestApp(repository);
  const response = await request(app).post('/api/auth/register').send({
    name: '  Ada Lovelace  ',
    email: 'ADA@EXAMPLE.COM',
    password: 'correct horse battery staple',
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.user.email, 'ada@example.com');
  assert.ok(response.body.accessToken);
  const stored = [...repository.users.values()][0];
  assert.notEqual(stored.passwordHash, 'correct horse battery staple');
  assert.match(response.headers['set-cookie'][0], /cinemaseat_refresh=.*HttpOnly/);
  assert.match(response.headers['set-cookie'][0], /Path=\/api\/auth/);
  assert.match(response.headers['set-cookie'][0], /SameSite=Lax/);

  const me = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${response.body.accessToken}`);
  assert.equal(me.status, 200);
  assert.deepEqual(me.body.user, response.body.user);
});

test('registration validates fields and rejects duplicate email addresses', async () => {
  const repository = createMemoryRepository();
  const app = createTestApp(repository);
  const invalid = await request(app).post('/api/auth/register').send({ name: 'A', email: 'bad', password: 'short' });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');

  const credentials = { name: 'Ada', email: 'ada@example.com', password: 'password123' };
  assert.equal((await request(app).post('/api/auth/register').send(credentials)).status, 201);
  const duplicate = await request(app).post('/api/auth/register').send(credentials);
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.error.code, 'EMAIL_IN_USE');
});

test('login succeeds with the correct password and hides credential failure details', async () => {
  const repository = createMemoryRepository();
  const app = createTestApp(repository);
  await request(app).post('/api/auth/register').send({ name: 'Ada', email: 'ada@example.com', password: 'password123' });

  const login = await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'password123' });
  assert.equal(login.status, 200);
  assert.ok(login.body.accessToken);

  for (const body of [
    { email: 'ada@example.com', password: 'wrong-password' },
    { email: 'missing@example.com', password: 'wrong-password' },
  ]) {
    const failure = await request(app).post('/api/auth/login').send(body);
    assert.equal(failure.status, 401);
    assert.equal(failure.body.error.code, 'INVALID_CREDENTIALS');
  }
});

test('refresh rotates the cookie and rejects replay of the previous token', async () => {
  const repository = createMemoryRepository();
  const app = createTestApp(repository);
  const registered = await request(app).post('/api/auth/register').send({
    name: 'Ada', email: 'ada@example.com', password: 'password123',
  });
  const oldCookie = registered.headers['set-cookie'][0].split(';')[0];

  const refreshed = await request(app).post('/api/auth/refresh').set('Cookie', oldCookie);
  assert.equal(refreshed.status, 200);
  assert.ok(refreshed.body.accessToken);
  assert.notEqual(refreshed.headers['set-cookie'][0].split(';')[0], oldCookie);

  const replay = await request(app).post('/api/auth/refresh').set('Cookie', oldCookie);
  assert.equal(replay.status, 401);
  assert.equal(replay.body.error.code, 'INVALID_REFRESH_TOKEN');
});

test('expired sessions fail refresh and logout revokes the current session', async () => {
  const repository = createMemoryRepository();
  const app = createTestApp(repository);
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({ name: 'Ada', email: 'ada@example.com', password: 'password123' });
  const session = [...repository.sessions.values()][0];
  session.expiresAt = new Date(0);
  assert.equal((await agent.post('/api/auth/refresh')).status, 401);

  const secondAgent = request.agent(app);
  await secondAgent.post('/api/auth/login').send({ email: 'ada@example.com', password: 'password123' });
  const logout = await secondAgent.post('/api/auth/logout');
  assert.equal(logout.status, 204);
  assert.match(logout.headers['set-cookie'][0], /cinemaseat_refresh=;/);
  assert.equal((await secondAgent.post('/api/auth/refresh')).status, 401);
});

test('missing and invalid bearer tokens are rejected', async () => {
  const app = createTestApp(createMemoryRepository());
  assert.equal((await request(app).get('/api/auth/me')).status, 401);
  assert.equal((await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid')).status, 401);
});
