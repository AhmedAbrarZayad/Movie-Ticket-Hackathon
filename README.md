# CinemaSeat

CinemaSeat is a concurrent movie-ticket booking system built with React, Nginx, Express, PostgreSQL, Redis, BullMQ, and the supplied CinemaSeat payment/OTP gateway. PostgreSQL is authoritative; Redis absorbs contention and coordinates shared limits/jobs.

## Architecture

```text
Nginx :8080 ── serves React SPA
    │ JWT + credentialed requests
    ▼
Express API ───── catalogue/authentication/booking modules
    │  │
    │  ├── Redis: seat lock filter, OTP state, shared rate limits, BullMQ
    │  ├── PostgreSQL: users, catalogue, holds, bookings, payments, webhook idempotency
    │  └── Gateway: OTP, charge, refund
    │                         │ signed callback
    └── BullMQ worker ◄───────┘ webhook processing + expired-hold sweep
```

Nginx is the browser-facing entry point. It serves the SPA, applies security headers and forwards `/api`, `/public`, and `/health` to Express. Seat holds use Redis `SET NX EX` followed by PostgreSQL `SELECT … FOR UPDATE`. Webhooks enter through Nginx, are authenticated over their raw bytes, queued immediately, and processed idempotently by `event_id`.

## Run locally

Prerequisites: Docker Desktop and Docker Compose.

```sh
cd backend
cp .env.example .env
docker compose up -d --build
docker compose run --rm backend npm run db:seed
```

The seed command is deliberately destructive. It resets all application rows and loads fictional deterministic movies, theatres, seven days of showtimes, and seat inventory. Normal `docker compose up` never deletes data.

Services:

- Application and API gateway: `http://localhost:8080`
- Direct backend diagnostics: `http://localhost:3000`
- Gateway/debug API: `http://localhost:9000`
- Proxied backend health: `GET http://localhost:8080/health`
- Nginx health: `GET http://localhost:8080/nginx-health`

Run the frontend separately with `cd frontend && npm ci && npm run dev`.

## Core API flow

Register or log in and use the returned access token as `Authorization: Bearer TOKEN`.

```sh
# Catalogue and showtimes
curl http://localhost:8080/api/catalogue/movies
curl "http://localhost:8080/api/catalogue/movies/MOVIE_ID/showtimes?date=2026-08-08"

# Public seat map — judging hook
curl http://localhost:8080/api/showtimes/SHOWTIME_ID/seats

# Atomic hold — judging hook
curl -X POST http://localhost:8080/api/showtimes/SHOWTIME_ID/holds \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"seatIds":["SEAT_ID"]}'

# Convert hold to booking
curl -X POST http://localhost:8080/api/bookings \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"holdId":"HOLD_ID"}'

# OTP then payment
curl -X POST http://localhost:8080/api/bookings/BOOKING_ID/otp/send \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -H "X-Mock-Mode: deterministic" -d '{"phone":"01700000000"}'
curl -X POST http://localhost:8080/api/bookings/BOOKING_ID/otp/verify \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"code":"123456"}'
curl -X POST http://localhost:8080/api/bookings/BOOKING_ID/pay \
  -H "Authorization: Bearer TOKEN" -H "X-Mock-Mode: deterministic"
```

Additional endpoints include booking list/details, refunds, `/api/webhooks/gateway`, and `/api/webhooks/otp`. Gateway force headers (`success`, `fail`, `duplicate`, `timeout`, `race`) are forwarded for judging.

## Tests and evidence

```sh
cd backend
npm ci
npm test
npm run build
docker compose config --quiet
```

Real PostgreSQL/Redis tests:

```sh
docker compose up -d db redis
npm run db:migrate
RUN_INTEGRATION_TESTS=true npm run test:integration
```

PowerShell users set `$env:RUN_INTEGRATION_TESTS='true'`. The suite proves exactly one winner among 100 buyers for one seat, hold expiry/reacquisition, and one charge under simultaneous payment requests. Results are recorded in [docs/LOAD_TEST_REPORT.md](docs/LOAD_TEST_REPORT.md).

## CI/CD and judging

GitHub Actions runs change-aware frontend/backend checks on pull requests and pushes to `main`. Backend CI starts PostgreSQL and Redis, runs unit and integration tests, builds both backend and Nginx/frontend images, and validates Compose. The `CI Success` check is intended for branch protection. Deployment runs only for pushes to `main`; replace the documented placeholder deploy commands with the target host credentials before production deployment.

For judging:

- Override `HOLD_TTL_SECONDS` to observe fast expiry.
- Use the exact seat-map and hold requests above.
- Use gateway force headers to exercise failure, duplicate, timeout, and race behavior.
- `GET /health` does not call the gateway and remains fast if it is unavailable.
- Gateway callbacks must use the Compose-reachable `http://backend:3000` address, never localhost.

See [backend/BOOKING_API.md](backend/BOOKING_API.md), [docs/architecture.txt](docs/architecture.txt), and [docs/CinemaSeat_Gateway_Reference.pdf](docs/CinemaSeat_Gateway_Reference.pdf) for more detail.
