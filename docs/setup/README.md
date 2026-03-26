# ZayKaur Setup Guide

How to run API Gateway, Server, and Web Frontend locally. For Cloud Run / managed services, use the same env vars and set URLs accordingly.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- (Optional) Redis for gateway cache

## 1. Environment

### Server (`server/`)

Copy `.env.example` to `.env` and set:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/zaykaur` |
| `JWT_SECRET` | Secret for JWT signing | strong random string |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `CORS_ORIGIN` | Allowed origin (frontend) | `http://localhost:3000` |

### API Gateway (`api-gateway/`)

Copy `.env.example` to `.env` and set:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Gateway port | `4000` |
| `SERVER_URL` | Backend server URL | `http://localhost:5000` |
| `REDIS_URL` | Redis URL (optional) | `redis://localhost:6379` or leave empty for in-memory |
| `PYTHON_SERVICE_URL` | Recommendation service (optional) | leave empty for MVP |
| `CORS_ORIGIN` | Allowed origin (frontend) | `http://localhost:3000` |

### Web Frontend (`web-frontend/`)

Create `.env.local`:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API base URL (Gateway) | `http://localhost:4000` |

## 2. Seed database

From repo root:

```bash
cd server
npm install
# Set MONGO_URI in .env
npm run seed
```

Seeded users (see `server/README.md`): admin, seller, customer with password `123456` (change in production).

## 3. Run services

**Terminal 1 – Server**

```bash
cd server
npm run dev
```

**Terminal 2 – API Gateway**

```bash
cd api-gateway
npm install
npm run dev
```

**Terminal 3 – Web Frontend**

```bash
cd web-frontend
npm install
npm run dev
```

- Frontend: http://localhost:3000  
- Gateway: http://localhost:4000  
- Server: http://localhost:5000 (not called directly by frontend; only via Gateway)

## 4. Cloud Run / managed services

- Run Server and Gateway as separate services. Set `SERVER_URL` on Gateway to the Server service URL.
- Set `CORS_ORIGIN` to your frontend origin(s).
- Use Redis (e.g. Memorystore) and set `REDIS_URL` on Gateway; if unset or unreachable, gateway uses in-memory cache (no cascade failure).
