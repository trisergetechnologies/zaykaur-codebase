# Architecture (MVP)

## Single entry point

All client traffic goes to the **API Gateway** only. The Server and Python recommendation service are not exposed directly to the frontend.

- **Web / Mobile / Dashboard** → **API Gateway** (e.g. `https://api.example.com` or `http://localhost:4000`)
- **API Gateway** → **Server** (internal URL, e.g. `http://server:5000` or Cloud Run URL)
- **API Gateway** → **Python service** (optional; when `PYTHON_SERVICE_URL` is set)

## Components

| Component | Role | Connectivity |
|-----------|------|--------------|
| **API Gateway** | Proxy, rate limit, CORS, optional cache (Redis or in-memory) | Reads `SERVER_URL`, `REDIS_URL`, `PYTHON_SERVICE_URL` from env. No cascade: if Redis is down or not set, uses in-memory fallback. |
| **Server** | Auth, business logic, MongoDB | Connects to MongoDB via `MONGO_URI`. Trusts `X-Forwarded-*` when behind Gateway. |
| **Redis** | Cache (product list, single product, optional token/profile) | Used by Gateway only. Connection via `REDIS_URL`. If unset or connection fails, Gateway uses in-memory store. |
| **Python service** | Recommendations (similar products, personalized) | Optional. Gateway proxies `/api/v1/recommendations*` to it. If not configured, returns 501. |

## No cascade failures

- **Redis:** Gateway never depends on Redis for correctness. Cache is best-effort; on failure or missing `REDIS_URL`, Gateway continues with in-memory cache.
- **Server:** If Server is down, Gateway returns 502; clients can retry or show a friendly error.
- **Python service:** If not configured or down, recommendation endpoints return 501 or 502; rest of the API works.

## Cloud Run / managed services

- Run **Gateway** and **Server** as separate services. Set `SERVER_URL` on Gateway to the Server service URL.
- Use env-based URLs only; no hardcoded hosts. Set `CORS_ORIGIN` to your frontend origin(s).
- For Redis, use a managed service (e.g. Memorystore) and set `REDIS_URL` on Gateway.
