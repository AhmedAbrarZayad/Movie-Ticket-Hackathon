import 'dotenv/config';
import express from 'express';
import { pathToFileURL } from 'node:url';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check — must return 200 in under 1 second, even if gateway is down
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
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
