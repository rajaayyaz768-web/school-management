import { redisClient, redisEnabled } from "../config/redis";

export const TTL = {
  MASTER_DATA:   30 * 60, // campuses, programs, subjects — 30 min
  SECTIONS:      10 * 60, // sections, grades — 10 min
  DASHBOARD:      5 * 60, // aggregate dashboard counts — 5 min
  RESULTS:            60, // student results — 60 s (heavy on result day)
  FEES:           3 * 60, // fee summaries — 3 min
  ANNOUNCEMENTS:  2 * 60, // announcements — 2 min
} as const;

// All helpers return null / no-op silently when Redis is disabled or disconnected,
// so callers always fall through to the database without needing their own checks.

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redisEnabled || !redisClient?.isOpen) return null;
  try {
    const val = await redisClient.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttl: number): Promise<void> {
  if (!redisEnabled || !redisClient?.isOpen) return;
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (!keys.length) return;
  if (!redisEnabled || !redisClient?.isOpen) return;
  try {
    await redisClient.del(keys);
  } catch {
    /* ignore */
  }
}

export async function cacheDelPattern(prefix: string): Promise<void> {
  if (!redisEnabled || !redisClient?.isOpen) return;
  try {
    for await (const key of redisClient.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
      await redisClient.del(key);
    }
  } catch {
    /* ignore */
  }
}
