import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";

import config from "./config/index.js";
import { initCache, quit as cacheQuit } from "./cache/store.js";
import { proxyToServer, proxyToPython } from "./proxy/serverProxy.js";
import {
  cacheProductList,
  cacheSingleProduct,
  saveToCacheIfOk,
} from "./middleware/cacheMiddleware.js";
import { requestContext } from "./middleware/requestContext.js";
import { accessLog } from "./middleware/accessLog.js";

const app = express();

app.use(
  cors({
    origin: config.corsOrigin.split(",").map((o) => o.trim()).filter(Boolean),
    credentials: true,
    exposedHeaders: ["X-Request-Id"],
  })
);
app.use(helmet());
app.use(requestContext);
app.use(accessLog);

const rawProxyUpload = createProxyMiddleware({
  target: config.serverUrl,
  changeOrigin: true,
  selfHandleResponse: false,
  pathRewrite: (path, req) => {
    const base = "/api/v1/upload";
    if (!path || path === "/") return base;
    return base + path;
  },
  on: {
    proxyReq: (proxyReq, req) => {
      if (req.requestId) {
        proxyReq.setHeader("X-Request-Id", req.requestId);
      }
    },
  },
});

app.use("/api/v1/upload", rawProxyUpload);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ZayKaur API Gateway",
    cache: config.redisUrl ? "redis" : "memory",
    requestId: req.requestId,
  });
});

app.get("/api/v1/public/products", cacheProductList, saveToCacheIfOk, (req, res, next) => {
  next();
}, proxyToServer);

app.get("/api/v1/public/products/single/:productId", cacheSingleProduct, saveToCacheIfOk, (req, res, next) => {
  next();
}, proxyToServer);

app.get("/api/v1/public/products/slug/:slug", (req, res, next) => {
  next();
}, proxyToServer);

app.all("/api/v1/recommendations*", (req, res) => {
  proxyToPython(req, res);
});

/**
 * When mounted at `/api/v1`, Express strips that prefix from `req.url`, so the proxy
 * would forward `/auth/login` to the backend → "Cannot POST /auth/login".
 * Always rewrite to the full `/api/v1/...` path the Express app expects.
 */
function rewriteApiV1Path(path) {
  const p = !path || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (p.startsWith("/api/v1")) return p || "/api/v1";
  return `/api/v1${p}`;
}

/**
 * Stream proxy for the rest of /api/v1 (JSON, PDF, uploads metadata, etc.).
 * Axios + responseType "json" in proxyToServer breaks binary responses (e.g. shipping labels).
 */
const apiV1StreamProxy = createProxyMiddleware({
  target: config.serverUrl,
  changeOrigin: true,
  pathRewrite: rewriteApiV1Path,
  on: {
    proxyReq: (proxyReq, req) => {
      if (req.requestId) {
        proxyReq.setHeader("X-Request-Id", req.requestId);
      }

      const method = (req.method || "GET").toUpperCase();
      if (
        ["POST", "PUT", "PATCH"].includes(method) &&
        req.body &&
        typeof req.body === "object" &&
        !Buffer.isBuffer(req.body)
      ) {
        const keys = Object.keys(req.body);
        if (keys.length > 0) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader(
            "Content-Length",
            String(Buffer.byteLength(bodyData, "utf8"))
          );
          proxyReq.write(bodyData);
        }
      }
    },
  },
});

app.use("/api/v1", apiV1StreamProxy);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found", data: null });
});

async function start() {
  await initCache();
  const port = config.port;
  app.listen(port, () => {
    console.log(`ZayKaur API Gateway running on port ${port}`);
    console.log(`  Server URL: ${config.serverUrl}`);
    console.log(`  CORS: ${config.corsOrigin}`);
  });
}

process.on("SIGTERM", async () => {
  await cacheQuit();
  process.exit(0);
});

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
