import crypto from "crypto";
import { getRedis } from "../config/redis.js";

const DEFAULT_TTL = 300;
export const ANALYTICS_CACHE_KEY = "admin:analytics";

export const cacheService = {
  isEnabled() {
    const redis = getRedis();
    return redis?.status === "ready";
  },

  buildKey(prefix, params) {
    const hash = crypto
      .createHash("md5")
      .update(JSON.stringify(params))
      .digest("hex");
    return `${prefix}:${hash}`;
  },

  async get(key) {
    const redis = getRedis();
    if (!redis || redis.status !== "ready") return null;

    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key, value, ttl = DEFAULT_TTL) {
    const redis = getRedis();
    if (!redis || redis.status !== "ready") return;

    await redis.setex(key, ttl, JSON.stringify(value));
  },

  async del(key) {
    const redis = getRedis();
    if (!redis || redis.status !== "ready") return;

    await redis.del(key);
  },

  async delPattern(pattern) {
    const redis = getRedis();
    if (!redis || redis.status !== "ready") return;

    let cursor = "0";

    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  },

  async invalidateProperties() {
    await this.delPattern("properties:*");
  },

  async invalidateAnalytics() {
    await this.del(ANALYTICS_CACHE_KEY);
  },

  async invalidateListingCaches() {
    await Promise.all([
      this.invalidateProperties(),
      this.invalidateAnalytics(),
    ]);
  },
};
