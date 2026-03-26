/**
 * In-memory brute-force protection for auth endpoints.
 * Limits login/register attempts per IP. For production, use Redis-backed rate limiting.
 */
const attempts = new Map();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (now - entry.firstAttempt > WINDOW_MS) {
      attempts.delete(key);
    }
  }
}

setInterval(cleanup, 60_000);

const rateLimitAuth = (req, res, next) => {
  const key = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttempt: now });
    return next();
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - entry.firstAttempt)) / 1000);
    return res.status(429).json({
      success: false,
      message: "Too many attempts. Please try again later.",
      data: null,
      retryAfter,
    });
  }

  entry.count++;
  next();
};

export default rateLimitAuth;
