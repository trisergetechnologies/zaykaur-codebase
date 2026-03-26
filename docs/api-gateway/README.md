# API Gateway

Single public entry point for all clients. Built with Node.js and Express.

## Responsibilities

- **Proxy:** Forwards all `/api/v1/*` requests to the Server (except `/api/v1/recommendations*`, which goes to the Python service when configured).
- **Cache:** Optional Redis cache for GET product list and single product. If `REDIS_URL` is not set or Redis is unavailable, an in-memory fallback is used (no cascade failure).
- **Rate limiting:** Per-IP rate limit (configurable via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`).
- **CORS:** Allows origins from `CORS_ORIGIN` (comma-separated).

## Env (see [Setup](../setup/README.md))

- `PORT` — Gateway port (default 4000).
- `SERVER_URL` — Backend server URL (required).
- `REDIS_URL` — Optional. Redis connection URL. If missing or connection fails, in-memory cache is used.
- `PYTHON_SERVICE_URL` — Optional. Recommendation service base URL.
- `CORS_ORIGIN` — Allowed origin(s) for the web frontend.
- `JWT_SECRET` — Optional; for future token validation at gateway.

## Running

```bash
cd api-gateway
npm install
npm run dev
```

## Health

- `GET /health` — Returns `{ success: true, message: "ZayKaur API Gateway", cache: "redis" | "memory" }`.
