import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { corsOptions } from "./config/cors";
import { generalLimiter } from "./middlewares/rateLimit.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { requestLogger } from "./middlewares/requestLogger.middleware";
import apiRouter from "./routes/index";

const app: Application = express();

// ─── 1. Security headers ───────────────────────────────────────────────────────────
app.use(helmet());

// ─── 2. CORS ───────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));

// ─── 3. Body parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── 4. Cookie parser ──────────────────────────────────────────────────────────────
app.use(cookieParser());

// ─── 5. Rate limiter ───────────────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── 6. Request logger ─────────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── 7. Health check ───────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── 8. API routes ───────────────────────────────────────────────────────────────
app.use("/api/v1", apiRouter);

// ─── 8. 404 handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── 9. Global error handler (must be last) ────────────────────────────────────
app.use(errorMiddleware);

export default app;
