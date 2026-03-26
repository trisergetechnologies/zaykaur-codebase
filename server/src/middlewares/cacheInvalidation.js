/**
 * Middleware to invalidate API gateway cache after write operations.
 * Sends an X-Cache-Invalidate header that the gateway can act on.
 * Also provides a utility to clear gateway cache via Redis directly.
 */

export const invalidateProductCache = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    if (body?.success && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      res.setHeader("X-Cache-Invalidate", "products");
    }
    return originalJson(body);
  };
  next();
};

export const invalidateCategoryCache = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    if (body?.success && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      res.setHeader("X-Cache-Invalidate", "categories");
    }
    return originalJson(body);
  };
  next();
};
