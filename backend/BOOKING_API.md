# Backend booking API

The catalogue uses deterministic fictional data. Reseeding is intentionally destructive:

```sh
docker compose run --rm backend npm run db:seed
```

Fetch a public seat map:

```sh
curl http://localhost:3000/api/showtimes/SHOWTIME_UUID/seats
```

Hold one to eight seats atomically:

```sh
curl -X POST http://localhost:3000/api/showtimes/SHOWTIME_UUID/holds \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"seatIds":["SEAT_UUID"]}'
```

Use the returned `holdId` with `POST /api/bookings`, then call the booking OTP send and verify endpoints before `POST /api/bookings/:bookingId/pay`. Payment completes asynchronously through `POST /api/webhooks/gateway`.

Gateway callbacks are authenticated with `X-Signature` using `GATEWAY_SECRET`. Charge retries reuse the booking reference as their `Idempotency-Key`. Confirmed bookings can request a refund through `POST /api/bookings/:bookingId/refund`; the signed `REFUNDED` callback completes the transition.

`HOLD_TTL_SECONDS` controls hold expiry. The default is 300 seconds.
