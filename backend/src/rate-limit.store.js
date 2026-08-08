import { connectedRedis } from './booking/redis.js';

export class RedisRateLimitStore {
  constructor(prefix = 'rate-limit:') { this.prefix = prefix; this.windowMs = 60_000; }
  init(options) { this.windowMs = options.windowMs; }
  async increment(key) {
    const redis = await connectedRedis(); const redisKey = `${this.prefix}${key}`;
    const totalHits = await redis.incr(redisKey);
    if (totalHits === 1) await redis.pExpire(redisKey, this.windowMs);
    const ttl = await redis.pTTL(redisKey);
    return { totalHits, resetTime: new Date(Date.now() + Math.max(ttl, 0)) };
  }
  async decrement(key) { const redis = await connectedRedis(); await redis.decr(`${this.prefix}${key}`); }
  async resetKey(key) { const redis = await connectedRedis(); await redis.del(`${this.prefix}${key}`); }
}
