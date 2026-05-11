import "dotenv/config";
import http from "http";
import app from "./app";
import { initSocket } from "./config/socket";
import { logger } from "./utils/logger";
import prisma from "./config/database";
import { connectRedis, redisClient, redisEnabled } from "./config/redis";
import { initQueues, startWorkers } from "./queues";

const PORT = parseInt(process.env.PORT || "5000", 10);

const httpServer = http.createServer(app);

async function start() {
  try {
    // Redis is opt-in via REDIS_URL env var. When set, we connect and create
    // queues. When unset, the entire Redis stack is skipped silently and the app
    // runs with in-process fallbacks (memory rate limiter, no cache, no queues).
    if (redisEnabled) {
      const redisUrl = process.env.REDIS_URL!;
      try {
        await connectRedis();
        initQueues(redisUrl);
        startWorkers(redisUrl);
      } catch (redisErr: any) {
        logger.warn(`Redis at ${redisUrl} unreachable — running with in-process fallbacks: ${redisErr.message}`);
      }
    } else {
      logger.info("Redis disabled (REDIS_URL not set) — using in-process fallbacks");
    }

    // Initialise Socket.io (Redis adapter applied only when Redis is connected)
    await initSocket(httpServer);

    // Verify database connection
    await prisma.$connect();
    logger.db.poolConnected();

    httpServer.listen(PORT, () => {
      logger.server(`Server running on port ${PORT}`);
      logger.server(`Environment: ${process.env.NODE_ENV ?? 'development'}`);
      logger.server(`API base URL: http://localhost:${PORT}/api/v1`);
    });
  } catch (err: any) {
    logger.error(`Startup failed: ${err.message}`);
    process.exit(1);
  }
}

start();

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  await prisma.$disconnect();
  if (redisClient?.isOpen) await redisClient.quit();
  httpServer.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
