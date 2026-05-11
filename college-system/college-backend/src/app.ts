import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import { corsOptions } from "./config/cors";
import { generalLimiter } from "./middlewares/rateLimit.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { requestLogger } from "./middlewares/requestLogger.middleware";
import apiRouter from "./routes/index";
import prisma from "./config/database";
import { getBoardRouter } from "./queues";
import { authenticate } from "./middlewares/auth.middleware";
import { authorize } from "./middlewares/role.middleware";

const app: Application = express();

// Trust the first proxy (Nginx on VPS) — required for correct req.ip,
// rate-limiter per-client enforcement, and Secure cookies behind HTTPS.
app.set("trust proxy", 1);

// ─── 0. Gzip compression ──────────────────────────────────────────────────────────
app.use(compression());

// ─── 1. Security headers ───────────────────────────────────────────────────────────
app.use(helmet());

// ─── 2. CORS ───────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));

// ─── 3. Body parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── 4. Cookie parser ──────────────────────────────────────────────────────────────
app.use(cookieParser());

// ─── 5. Health checks (before rate limiter and auth — no token required) ──────────
app.get("/health/live", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/health/ready", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected", uptime: process.uptime() });
  } catch {
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});

// Legacy alias — keeps any existing health probes working
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── 6. Rate limiter ───────────────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── 7. Request logger ─────────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── 8. API routes ───────────────────────────────────────────────────────────────
app.use("/api/v1", apiRouter);

// ─── 8a. Queue dashboard — SUPER_ADMIN only (lazy: only active when Redis is connected)
app.use("/api/v1/admin/queues", authenticate, authorize("SUPER_ADMIN"), (req, res, next) => {
  const router = getBoardRouter();
  if (!router) return res.status(503).json({ success: false, message: "Queue dashboard unavailable — Redis not connected" });
  router(req, res, next);
});

// ─── 9. 404 handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── 9. Global error handler (must be last) ────────────────────────────────────
app.use(errorMiddleware);

export default app;
