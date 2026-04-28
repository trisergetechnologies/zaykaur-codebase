# ZayKaur Notification Service

Ingress: `POST /events` with JSON body. Authenticate with header `X-Notification-Secret` (value = `NOTIFICATION_SERVICE_SECRET`).

Phase 1: maps `eventType` to Nodemailer emails. Idempotent on `eventId`.

Phase 2 (same payload): replace HTTP with a queue consumer; add Firebase in `src/providers/push.js` (stub exists in `push.stub.js`).

## Idempotency and scaling

`eventId` is deduplicated in memory (`src/services/idempotency.js`). For multiple instances or strict guarantees, replace this with Redis or a DB table keyed by `eventId` — keep the same JSON contract so an HTTP handler or a BullMQ worker can share one orchestrator.

## Run

```bash
cd notification-service
cp .env.example .env
# set NOTIFICATION_SERVICE_SECRET and SMTP_*
npm install
npm run dev
```

`src/loadEnv.js` loads **`notification-service/.env`** from this package’s path, so variables apply even if you start Node from the monorepo root. Prefer `cd notification-service` before `npm run dev` anyway.

Main app must set `NOTIFICATION_SERVICE_URL` (e.g. `http://localhost:5055`) and the same shared secret in **`server/.env`** (the API loads that file explicitly, not the repo root).

## Health

`GET /health` — no auth.
