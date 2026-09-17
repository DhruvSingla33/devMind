import { getRedisClient, isCacheAvailable } from '../config/redis.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Express middleware for caching GET responses in Redis
 * @param {string} keyPrefix - Prefix for Redis key
 * @param {number} [ttlSeconds=300] - Expiry time in seconds
 */
export const cacheMiddleware = (keyPrefix, ttlSeconds = 300) => {
  return async (req, res, next) => {
    if (!isCacheAvailable() || req.method !== 'GET') {
      return next();
    }

    const redis = getRedisClient();
    const key = `${keyPrefix}:${req.originalUrl || req.url}`;

    try {
      const cachedData = await redis.get(key);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        return res
          .status(200)
          .json(new ApiResponse(200, parsed, 'Data retrieved from Redis cache'));
      }

      // Intercept res.json to store in Redis before responding
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (body && body.success && body.data) {
          redis.setex(key, ttlSeconds, JSON.stringify(body.data)).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      next(); // Fail open, continue to MongoDB controller if Redis errors out
    }
  };
};

/**
 * Invalidate Redis keys by pattern on Admin mutations
 */
export const invalidateCachePattern = async (pattern) => {
  if (!isCacheAvailable()) return;
  const redis = getRedisClient();
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[Redis Cache] Invalidated ${keys.length} keys matching '${pattern}'`);
    }
  } catch (err) {
    // Ignore cache error
  }
};
