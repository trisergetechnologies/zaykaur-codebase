import { randomUUID } from "crypto";

/**
 * Assign a correlation ID for the request (transaction / trace).
 * Reuses X-Request-Id from client when present; otherwise generates UUID.
 * Matches backend [server/src/middlewares/requestId.js] behavior.
 */
export function requestContext(req, res, next) {
  const incoming =
    typeof req.headers["x-request-id"] === "string"
      ? req.headers["x-request-id"].trim()
      : "";
  const requestId = incoming || randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}
