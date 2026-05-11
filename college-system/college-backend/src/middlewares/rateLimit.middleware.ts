import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient, redisEnabled } from "../config/redis";

// When Redis is disabled (no REDIS_URL set), express-rate-limit defaults to its
// built-in in-memory store. That's correct for dev / single-instance deployments.
// In production with Redis, RedisStore is used so counters are shared across PM2
// workers and multiple servers.
const makeStore = (prefix: string) => {
  if (!redisEnabled || !redisClient) return undefined;
  return new RedisStore({
    sendCommand: (...args: string[]) => (redisClient as any).sendCommand(args),
    prefix,
  });
};

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore("rl:general:"),
  message: {
    success: false,
    message: "Too many requests, please try again in a minute.",
    error: "RATE_LIMIT_EXCEEDED",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  store: makeStore("rl:auth:"),
  message: {
    success: false,
    message: "Too many login attempts, please try again in 15 minutes.",
    error: "AUTH_RATE_LIMIT_EXCEEDED",
  },
});
