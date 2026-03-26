/**
 * Gateway config. All external connectivity via URLs only (Cloud Run / managed services).
 * No cascade failures: missing REDIS_URL => in-memory fallback.
 */
import dotenv from "dotenv";

dotenv.config();

const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",

  /** Backend server (internal URL in production, e.g. Cloud Run service URL). */
  serverUrl: process.env.SERVER_URL || "http://localhost:5000",

  /** Optional. If set and connectable, use Redis; else in-memory. */
  redisUrl: process.env.REDIS_URL || null,

  /** Optional. Recommendation service; if not set, /api/v1/recommendations returns 501. */
  pythonServiceUrl: process.env.PYTHON_SERVICE_URL || null,

  /** CORS: allowed origin for web frontend (comma-separated for multiple). */
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

  /** JWT secret for optional token validation at gateway (e.g. cache user by token). */
  jwtSecret: process.env.JWT_SECRET || null,

  /** Rate limit: max requests per window per IP */
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,
};

export default config;
