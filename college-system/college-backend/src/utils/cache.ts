import NodeCache from "node-cache";

const cache = new NodeCache({ checkperiod: 60, useClones: false });

export const TTL = {
  MASTER_DATA: 30 * 60,   // campuses, programs, subjects — 30 min
  SECTIONS:    10 * 60,   // sections, grades — 10 min
  DASHBOARD:    5 * 60,   // aggregate dashboard counts — 5 min
  RESULTS:          60,   // student results — 60 s (heavy on result day)
  FEES:         3 * 60,   // fee summaries — 3 min
  ANNOUNCEMENTS: 2 * 60,  // announcements — 2 min
} as const;

export function cacheGet<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function cacheSet<T>(key: string, value: T, ttl: number): void {
  cache.set(key, value, ttl);
}

export function cacheDel(...keys: string[]): void {
  cache.del(keys);
}

export function cacheDelPattern(prefix: string): void {
  const keys = cache.keys().filter((k) => k.startsWith(prefix));
  if (keys.length) cache.del(keys);
}
