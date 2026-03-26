import logger from "../config/logger.js";

/**
 * HTTP request/response logger using Pino.
 * Replaces morgan with structured JSON logging.
 */
const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };

    if (res.statusCode >= 500) {
      logger.error(logData, "request failed");
    } else if (res.statusCode >= 400) {
      logger.warn(logData, "client error");
    } else {
      logger.info(logData, "request completed");
    }
  });

  next();
};

export default httpLogger;
