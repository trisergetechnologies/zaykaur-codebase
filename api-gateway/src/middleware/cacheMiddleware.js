/**
 * Optional cache middleware: cache GET responses for product list and single product.
 * Uses cache store (Redis or in-memory). No cascade: cache miss => proxy as usual.
 */

import * as cache from "../cache/store.js";

const CACHE_TTL = 60; // 1 min for product list
const CACHE_TTL_PRODUCT = 300; // 5 min for single product

export async function cacheProductList(req, res, next) {
  if (req.method !== "GET") return next();
  const key = `products:list:${JSON.stringify(req.query || {})}`;
  const cached = await cache.get(key);
  if (cached) {
    return res.status(200).json(cached);
  }
  res.locals.cacheKey = key;
  res.locals.cacheTtl = CACHE_TTL;
  next();
}

export async function cacheSingleProduct(req, res, next) {
  if (req.method !== "GET") return next();
  const id = req.params.productId || req.params.id;
  if (!id) return next();
  const key = `product:${id}`;
  const cached = await cache.get(key);
  if (cached) {
    return res.status(200).json(cached);
  }
  res.locals.cacheKey = key;
  res.locals.cacheTtl = CACHE_TTL_PRODUCT;
  next();
}

export function saveToCacheIfOk(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    const key = res.locals?.cacheKey;
    const ttl = res.locals?.cacheTtl;
    if (key && ttl && res.statusCode === 200 && body?.success && body?.data) {
      cache.set(key, body, ttl).catch(() => {});
    }
    return originalJson(body);
  };
  next();
}
