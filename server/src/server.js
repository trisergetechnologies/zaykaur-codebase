import "./loadEnv.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

import connectDB from "./config/db.js";
import logger from "./config/logger.js";
import errorHandler from "./middlewares/errorHandler.js";
import httpLogger from "./middlewares/httpLogger.js";
import requestId from "./middlewares/requestId.js";
import router from "./routes/index.js";

connectDB();

const app = express();

app.set("trust proxy", 1);

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(
  cors({
    origin: corsOrigin.split(",").map((o) => o.trim()).filter(Boolean),
    credentials: true,
  })
);
app.use(
  helmet({
    // Allow cross-origin dashboards (e.g. localhost:3001) to use PDF/binary responses (blob downloads).
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(requestId);
app.use(httpLogger);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// express-mongo-sanitize middleware crashes on Express 5 because req.query is
// a read-only getter. Apply sanitization only to body/params/headers manually.
app.use((req, _res, next) => {
  for (const key of ["body", "params", "headers"]) {
    if (req[key]) {
      req[key] = mongoSanitize.sanitize(req[key]);
    }
  }
  // Sanitize query values in-place (the object is mutable, only the property is not)
  if (req.query && typeof req.query === "object") {
    const sanitized = mongoSanitize.sanitize(req.query);
    for (const k of Object.keys(sanitized)) {
      try { req.query[k] = sanitized[k]; } catch { /* frozen key, skip */ }
    }
  }
  next();
});
app.use(hpp({ checkQuery: false }));

app.use('/api/v1', router);

// ================= HEALTH CHECK =================
app.get("/health", async (req, res) => {
  try {
    const dbState = (await import("mongoose")).default.connection.readyState;
    res.status(200).json({
      success: true,
      message: "ZayKaur Server is running",
      db: dbState === 1 ? "connected" : "disconnected",
      uptime: process.uptime(),
    });
  } catch {
    res.status(503).json({ success: false, message: "Unhealthy" });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ZayKaur Server is running",
  });
});

app.use(errorHandler);

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
