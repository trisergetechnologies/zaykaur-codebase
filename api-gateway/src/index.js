import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
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

const app = express();

app.use(
  cors({
    origin: config.corsOrigin.split(",").map((o) => o.trim()).filter(Boolean),
    credentials: true,
  })
);
app.use(helmet());

const rawProxyUpload = createProxyMiddleware({
  target: config.serverUrl,
  changeOrigin: true,
  selfHandleResponse: false,
  pathRewrite: (path, req) => {
    const base = "/api/v1/upload";
    if (!path || path === "/") return base;
    return base + path;
  },
});

app.use("/api/v1/upload", rawProxyUpload);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}

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

app.use("/api/v1", (req, res, next) => {
  proxyToServer(req, res);
});

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
