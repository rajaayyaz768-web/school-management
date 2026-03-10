import "dotenv/config";
import http from "http";
import app from "./app";
import { initSocket } from "./config/socket";
import { logger } from "./utils/logger";
import prisma from "./config/database";

const PORT = parseInt(process.env.PORT || "5000", 10);

const httpServer = http.createServer(app);

// Initialise Socket.io
initSocket(httpServer);

// Verify database connection then start listening
prisma
  .$connect()
  .then(() => {
    logger.info("Database connected ✔✓");

    httpServer.listen(PORT, () => {
      logger.info(`────────────────────────────────────────────────`);
      logger.info(`🏫  College Management System API`);
      logger.info(`   Server running on port ${PORT}`);
      logger.info(`   Health: http://localhost:${PORT}/health`);
      logger.info(`   API:    http://localhost:${PORT}/api/v1`);
      logger.info(`   Env:    ${process.env.NODE_ENV}`);
      logger.info(`────────────────────────────────────────────────`);
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to database:", err);
    process.exit(1);
  });

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  await prisma.$disconnect();
  httpServer.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
