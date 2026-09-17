import Redis from 'ioredis';

let redisClient = null;
let isRedisConnected = false;

try {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        return null; // Stop retrying after 3 attempts
      }
      return Math.min(times * 100, 2000);
    },
  });

  redisClient.connect().then(() => {
    isRedisConnected = true;
    console.log('[Redis] Connected to Redis caching server');
  }).catch((err) => {
    isRedisConnected = false;
    console.log('[Redis Notice] Redis server not available locally. Backend running cleanly with DB direct queries.');
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
  });
} catch (e) {
  isRedisConnected = false;
}

export const getRedisClient = () => redisClient;
export const isCacheAvailable = () => isRedisConnected;
