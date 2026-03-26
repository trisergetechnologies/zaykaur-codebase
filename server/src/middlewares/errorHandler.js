import AppError from "../utils/AppError.js";

/**
 * Centralized Express error handler.
 * Catches all errors thrown/next(err) in route handlers.
 */
const agentLog = (payload) => {
  // #region agent log
  fetch("http://127.0.0.1:7903/ingest/c232eb23-7656-469e-86bf-c4e24659685a", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9435c8" },
    body: JSON.stringify({
      sessionId: "9435c8",
      timestamp: Date.now(),
      ...payload,
    }),
  }).catch(() => {});
  // #endregion
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  const url = String(req.originalUrl || req.url || "");
  if (url.includes("/upload")) {
    // #region agent log
    agentLog({
      hypothesisId: "H1",
      location: "errorHandler.js:uploadPath",
      message: "error on upload route",
      data: {
        url: url.slice(0, 120),
        errName: err?.name,
        errMsg: String(err?.message || err).slice(0, 220),
      },
    });
    // #endregion
  }
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let isOperational = err.isOperational || false;

  if (err.name === "ValidationError") {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(". ");
    isOperational = true;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    isOperational = true;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue).join(", ");
    message = `Duplicate value for: ${field}`;
    isOperational = true;
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    isOperational = true;
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    isOperational = true;
  }

  if (err.name === "ZodError") {
    statusCode = 400;
    message = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    isOperational = true;
  }

  if (!isOperational && process.env.NODE_ENV !== "development") {
    message = "Something went wrong";
  }

  if (process.env.NODE_ENV === "development" && !isOperational) {
    console.error("[ErrorHandler]", err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    ...(process.env.NODE_ENV === "development" && !isOperational
      ? { stack: err.stack }
      : {}),
  });
};

export default errorHandler;
