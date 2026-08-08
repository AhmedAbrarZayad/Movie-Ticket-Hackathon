# CinemaSeat concurrency evidence

## Environment

- Node.js test runner outside the API process
- PostgreSQL 17 and Redis 7
- Deterministic seeded catalogue and one exact contention target
- Command: `RUN_INTEGRATION_TESTS=true npm run test:integration`

## Scenario A: one seat, 100 buyers

| Metric | Expected | Observed |
| --- | ---: | ---: |
| Requests | 100 | 100 |
| Successful holds | 1 | 1 |
| Clean rejections | 99 | 99 |
| Oversells | 0 | 0 |

All requests target the same `(showtimeId, seatId)`. Redis absorbs contention and PostgreSQL row locking guarantees correctness.

Observed locally on the isolated Compose validation stack: the 100-request collision completed in 1.75 seconds; the full three-scenario suite completed in 6.77 seconds. These timings document the test run, not a hardware-independent throughput claim.

## Scenario B: abandoned hold

With `HOLD_TTL_SECONDS=1`, user A holds the seat, the test waits 1.2 seconds, and user B successfully reacquires it. PostgreSQL finishes with exactly one held inventory row owned by user B.

## Simultaneous payment requests

Twenty-five concurrent payment requests target one OTP-verified booking. The partial unique index creates one pending payment and an atomic initiation claim permits one outbound charge. Observed: one payment row and one gateway call.

## Reproduction

```sh
cd backend
docker compose up -d db redis
npm run db:migrate
RUN_INTEGRATION_TESTS=true npm run test:integration
```

PowerShell: set `$env:RUN_INTEGRATION_TESTS='true'` before the final command.
