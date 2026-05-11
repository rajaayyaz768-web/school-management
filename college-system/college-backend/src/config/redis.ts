import { createClient, RedisClientType } from "redis";
import { logger } from "../utils/logger";

declare global {
  // eslint-disable-next-line no-var
  var redisClient: RedisClientType | null | undefined;
}

const REDIS_URL = process.env.REDIS_URL;
const isProd = process.env.NODE_ENV === "production";

// Redis is opt-in: REDIS_URL must be explicitly set. If unset, the entire Redis
// stack (cache, rate limiter, socket adapter, queues) is skipped silently. This
// keeps the dev environment clean for users who haven't installed Redis locally.
export const redisEnabled: boolean = !!REDIS_URL;

const reconnectStrategy = (retries: number): number | false => {
  if (!isProd && retries >= 3) {
    logger.warn("Redis: max retries reached — falling back to in-process mode");
    return false;
  }
  return Math.min(retries * 500, 3000);
};

const client: RedisClientType | null = redisEnabled
  ? ((global.redisClient as RedisClientType | undefined) ??
      createClient({
        url: REDIS_URL,
        socket: { reconnectStrategy },
      }))
  : null;

if (!isProd) {
  global.redisClient = client;
}

if (client) {
  let errorLogged = false;
  client.on("error", (err) => {
    if (!errorLogged || isProd) {
      logger.error(`Redis error: ${err.message}`);
      errorLogged = true;
    }
  });
  client.on("connect", () => {
    errorLogged = false;
    logger.server("Redis connected");
  });
  client.on("reconnecting", () => {
    if (isProd) logger.warn("Redis reconnecting...");
  });
}

export async function connectRedis(): Promise<void> {
  if (client && !client.isOpen) {
    await client.connect();
  }
}

export const redisClient = client;
export default client;
