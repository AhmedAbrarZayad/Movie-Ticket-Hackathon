import { createClient } from 'redis';

let client;
export function getRedisClient() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL ?? 'redis://localhost:6379' });
    client.on('error', (error) => console.error('Redis error:', error.message));
  }
  return client;
}

export async function connectedRedis() {
  const redis = getRedisClient();
  if (!redis.isOpen) await redis.connect();
  return redis;
}

export function seatLockKey(showtimeId, seatId) { return `seat-hold:${showtimeId}:${seatId}`; }

export async function acquireSeatLocks(showtimeId, seatIds, holdId, ttlSeconds) {
  let redis;
  try { redis = await connectedRedis(); } catch { return { acquired: true, degraded: true, keys: [] }; }
  const keys = [];
  for (const seatId of [...seatIds].sort()) {
    const key = seatLockKey(showtimeId, seatId);
    const result = await redis.set(key, holdId, { NX: true, EX: ttlSeconds });
    if (result !== 'OK') {
      if (keys.length) await redis.del(keys);
      return { acquired: false, degraded: false, keys: [] };
    }
    keys.push(key);
  }
  return { acquired: true, degraded: false, keys };
}

export async function releaseKeys(keys) {
  if (!keys?.length) return;
  try { const redis = await connectedRedis(); await redis.del(keys); } catch { /* DB remains authoritative. */ }
}
