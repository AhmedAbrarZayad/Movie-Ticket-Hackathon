# CinemaSeat

CinemaSeat is a hackathon-scale movie ticketing platform built to stay reliable when a blockbuster premiere creates a traffic spike. The project combines a React frontend, an Express backend, PostgreSQL for authoritative state, Redis for contention relief and rate limiting, and a background worker for asynchronous booking/payment processing.

The goal is simple: let users browse shows, hold a seat, complete payment, and receive a confirmed booking without selling the same seat twice.

## What the system does

CinemaSeat currently supports:

- User registration, login, refresh, logout, and current-user retrieval
- Movie and theatre catalogue browsing
- Showtime and seat-map retrieval
- Seat holding with auth-protected flows
- Booking creation and booking detail lookup
- OTP send/verify steps for booking confirmation
- Payment and refund flows through the provided gateway
- Webhook handling for payment and OTP callbacks
- Rate limiting and auth-protected routes in the request pipeline

## Architecture

```text
Browser / Nginx / React SPA
        │
        ▼
Express API (monolith)
  ├─ Authentication module
  ├─ Catalogue module
  ├─ Booking module
  ├─ Webhook handling
  └─ Shared middleware (rate limiting, auth, validation)
        │
        ├─ PostgreSQL  → users, catalogue, bookings, payments, webhook state
        ├─ Redis       → rate limiting, seat-hold coordination, shared state
        └─ BullMQ worker → background cleanup / webhook processing
```

The request flow follows the architecture guidance from the project brief: rate limiting comes before authentication, authentication comes before business logic, and the booking path is designed to be safe under concurrent seat contention.

## Project structure

- backend/: Express API, authentication, booking, catalogue, Prisma-style contract files, tests, and Docker setup
- frontend/: React + Vite UI for browsing movies and interacting with the booking flow
- nginx/: reverse proxy layer for the application
- docs/: architecture notes and hackathon problem statement

## Run locally

### Prerequisites

- Docker Desktop
- Docker Compose
- Node.js (optional, for local backend/frontend development outside containers)

### 1) Clone and prepare environment

```bash
git clone <repo-url>
cd Movie-Ticket-Hackathon/backend
cp .env.example .env
```

Update the environment values if needed, especially the database connection string and JWT secrets.

### 2) Start the full stack

```bash
docker compose up -d --build
```

### 3) Seed initial data

The seed step is deliberately destructive and resets the application data before loading deterministic sample movies, theatres, showtimes, and seats.

```bash
docker compose run --rm backend npm run db:seed
```

### 4) Access the app

- Frontend + API gateway: http://localhost:8080
- Direct backend: http://localhost:3000
- Gateway/debug API: http://localhost:9000
- Health check: http://localhost:8080/health

## Authentication and API flow

Register or log in to receive a JWT access token and a refresh cookie.

### Register

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"password123"}'
```

### Current user

```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <access-token>"
```

### Seat map

```bash
curl http://localhost:8080/api/showtimes/SHOWTIME_ID/seats
```

### Hold a seat

```bash
curl -X POST http://localhost:8080/api/showtimes/SHOWTIME_ID/holds \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"seatIds":["SEAT_ID"]}'
```

### Convert a hold into a booking

```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"holdId":"HOLD_ID"}'
```

### OTP and payment

```bash
curl -X POST http://localhost:8080/api/bookings/BOOKING_ID/otp/send \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"phone":"01700000000"}'

curl -X POST http://localhost:8080/api/bookings/BOOKING_ID/otp/verify \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'

curl -X POST http://localhost:8080/api/bookings/BOOKING_ID/pay \
  -H "Authorization: Bearer <access-token>"
```

## Testing

Backend tests are available through the Node test runner.

```bash
cd backend
npm test
```

Additional integration-oriented checks can be run with:

```bash
npm run test:integration
```

The project is also prepared for container-based validation with Docker Compose.

## Notes for the hackathon problem statement

This implementation targets the core booking path from the problem statement:

- Protect the booking flow under peak demand
- Prevent overselling the same seat
- Keep health checks fast even when the gateway is unavailable
- Support async payment and OTP flows without blocking the user experience
- Document the exact hold and seat-map requests needed for judging

The repository is intended as a working demo and a strong foundation for further hardening, deployment, and load testing.
