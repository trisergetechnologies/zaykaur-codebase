/**
 * Cache store: Redis if REDIS_URL is set and connectable; otherwise in-memory.
 * Single responsibility: get/set/del. No cascade failure - fallback is transparent.
 */

import Redis from "ioredis";
import config from "../config/index.js";

const TTL_SECONDS = 300; // 5 min default for cached responses

let client = null;
let useMemory = true;

async function connectRedis() {
  if (!config.redisUrl || typeof config.redisUrl !== "string") {
    return null;
  }
  try {
    const redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 2,
      retryStrategy: () => null,
      lazyConnect: true,
    });
    await redis.connect();
    redis.on("error", () => {});
    return redis;
  } catch {
    return null;
  }
}

const memoryStore = new Map();

export async function initCache() {
  const redis = await connectRedis();
  if (redis) {
    client = redis;
    useMemory = false;
    if (config.nodeEnv === "development") {
      console.log("[Gateway] Cache: Redis connected");
    }
  } else {
    client = null;
    useMemory = true;
    if (config.nodeEnv === "development") {
      console.log("[Gateway] Cache: using in-memory fallback (REDIS_URL not set or unavailable)");
    }
  }
}

export function isRedisConnected() {
  return client != null && !useMemory;
}

export async function get(key) {
  if (useMemory) {
    const entry = memoryStore.get(key);
    if (!entry) return null;
    if (entry.expiry && Date.now() > entry.expiry) {
      memoryStore.delete(key);
      return null;
    }
    return entry.value;
  }
  try {
    const v = await client.get(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

export async function set(key, value, ttlSeconds = TTL_SECONDS) {
  if (useMemory) {
    memoryStore.set(key, {
      value,
      expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
    return;
  }
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
  } catch {
    // ignore
  }
}

export async function del(key) {
  if (useMemory) {
    memoryStore.delete(key);
    return;
  }
  try {
    await client.del(key);
  } catch {
    // ignore
  }
}

export async function quit() {
  if (client && !useMemory) {
    await client.quit();
    client = null;
  }
}
