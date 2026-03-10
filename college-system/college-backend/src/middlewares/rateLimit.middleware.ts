import rateLimit from "express-rate-limit";

// General rate limiter — 100 req/min per IP
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again in a minute.",
    error: "RATE_LIMIT_EXCEEDED",
  },
});

// Strict limiter for auth routes — 10 req/15min per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts, please try again in 15 minutes.",
    error: "AUTH_RATE_LIMIT_EXCEEDED",
  },
});
