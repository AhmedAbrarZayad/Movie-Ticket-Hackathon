import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { pathToFileURL } from 'node:url';
import { catalogueRouter } from './src/catalogue/catalogue.routes.js';
import { createAuthenticationRouter } from './src/authentication/authentication.routes.js';
import { AuthenticationError } from './src/authentication/authentication.errors.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use('/api/catalogue', catalogueRouter);

// Health check — must return 200 in under 1 second, even if gateway is down
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', createAuthenticationRouter());

app.use((error, request, response, next) => {
  if (response.headersSent) return next(error);
  if (error instanceof AuthenticationError) {
    response.status(error.status).json({
      error: { code: error.code, message: error.message, ...(error.details && { details: error.details }) },
    });
    return;
  }

  console.error(error);
  response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } });
});

export function startServer(port = PORT) {
  return app.listen(port, () => {
    console.log(`CinemaSeat backend running on port ${port}`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}

export default app;
