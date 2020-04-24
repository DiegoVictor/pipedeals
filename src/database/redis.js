import { createClient } from 'redis';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import ExpressBruteFlexible from 'rate-limiter-flexible/lib/ExpressBruteFlexible';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createClient as mockClient } from 'redis-mock';

const redis = (() => {
  if (process.env.NODE_ENV === 'test') {
    return mockClient();
  }

  return createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  });
})();

export function RateLimiter(opts) {
  if (process.env.NODE_ENV === 'test') {
    return new RateLimiterMemory(opts);
  }

  return new RateLimiterRedis({ redis, ...opts });
}

export function BruteForce(opts) {
  if (process.env.NODE_ENV === 'test') {
    return new ExpressBruteFlexible(
      ExpressBruteFlexible.LIMITER_TYPES.MEMORY,
      opts
    );
  }

  return new ExpressBruteFlexible(ExpressBruteFlexible.LIMITER_TYPES.REDIS, {
    ...opts,
    storeClient: redis,
  });
}

export default redis;
