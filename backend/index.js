import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check — must return 200 in under 1 second, even if gateway is down
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🎬 CinemaSeat backend running on port ${PORT}`);
});
