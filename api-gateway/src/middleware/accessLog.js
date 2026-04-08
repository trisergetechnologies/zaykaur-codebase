import logger from "../logger.js";

/**
 * One structured log line per request when the response finishes.
 */
export function accessLog(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const payload = {
      requestId: req.requestId,
      transactionId: req.requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip || req.socket?.remoteAddress,
      userAgent: req.get("user-agent"),
    };

    if (res.statusCode >= 500) {
      logger.error(payload, "gateway request failed");
    } else if (res.statusCode >= 400) {
      logger.warn(payload, "gateway client error");
    } else {
      logger.info(payload, "gateway request completed");
    }
  });

  next();
}
