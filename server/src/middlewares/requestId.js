import { v4 as uuidv4 } from "uuid";

/**
 * Attaches a unique request ID to every request.
 * Propagates X-Request-Id header if present (from gateway).
 */
const requestId = (req, res, next) => {
  req.id = req.headers["x-request-id"] || uuidv4();
  res.setHeader("X-Request-Id", req.id);
  next();
};

export default requestId;
