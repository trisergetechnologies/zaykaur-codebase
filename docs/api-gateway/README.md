# API Gateway

Single public entry point for all clients. Built with Node.js and Express.

## Responsibilities

- **Proxy:** Forwards `/api/v1/*` to the Server with a **streaming HTTP proxy** (so JSON, **PDFs** (e.g. seller shipping labels), and other binary responses pass through correctly). Exceptions: `/api/v1/upload` uses a dedicated raw proxy; `/api/v1/recommendations*` goes to the Python service when configured; a few **public product** GET routes still use an internal JSON proxy path for response caching only.
- **Cache:** Optional Redis cache for GET product list and single product. If `REDIS_URL` is not set or Redis is unavailable, an in-memory fallback is used (no cascade failure).
- **Rate limiting:** Per-IP rate limit (configurable via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`).
- **Request correlation:** Gateway assigns `X-Request-Id` (transaction ID) for every request and forwards it upstream.
- **Access logging:** Structured per-request logs include `requestId`, method, path, status, and duration.
- **CORS:** Allows origins from `CORS_ORIGIN` (comma-separated) and exposes `X-Request-Id` to browsers.

## Env (see [Setup](../setup/README.md))

- `PORT` — Gateway port (default 4000).
- `SERVER_URL` — Backend server URL (required).
- `REDIS_URL` — Optional. Redis connection URL. If missing or connection fails, in-memory cache is used.
- `PYTHON_SERVICE_URL` — Optional. Recommendation service base URL.
- `CORS_ORIGIN` — Comma-separated browser origins (default in code includes `http://localhost:3000` and `http://localhost:3001` for storefront + Admin-Seller dashboard).
- `JWT_SECRET` — Optional; reserved for JWT validation or cache keying at the gateway (not required for the stream proxy to forward `Authorization`).
- `LOG_LEVEL` — Optional Pino log level (`trace`, `debug`, `info`, `warn`, `error`, `fatal`).

## Running

```bash
cd api-gateway
npm install
npm run dev
```

## Health

- `GET /health` — Returns `{ success: true, message: "ZayKaur API Gateway", cache: "redis" | "memory", requestId }` and includes response header `X-Request-Id`.

## Troubleshooting

- **`Cannot POST /auth/login` on the backend** — The stream proxy is mounted at `/api/v1`, so the forwarded path must be rewritten back to `/api/v1/...`. The gateway implements this in `pathRewrite` (`rewriteApiV1Path` in `src/index.js`). If you change mount paths, keep this in sync.

## Correlation ID

- Canonical transaction header: `X-Request-Id`.
- If a client provides `X-Request-Id`, gateway reuses it; otherwise it generates a UUID.
- Gateway returns `X-Request-Id` in responses and forwards the same value to Server/Python so logs can be correlated end-to-end.
- For bug reports, always capture the transaction ID from response headers.
