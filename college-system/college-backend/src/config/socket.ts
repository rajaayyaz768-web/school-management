import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import jwt from "jsonwebtoken";
import { corsOptions } from "./cors";
import { jwtConfig } from "./jwt";
import { redisClient, redisEnabled } from "./redis";
import { logger } from "../utils/logger";

export let io: SocketServer;

export const initSocket = async (httpServer: HttpServer): Promise<SocketServer> => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: corsOptions.origin,
      credentials: true,
    },
  });

  // Redis pub/sub adapter — required for multi-worker event broadcasting.
  // Skipped silently when Redis is disabled (single-worker dev mode).
  if (redisEnabled && redisClient?.isOpen) {
    try {
      const subClient = redisClient.duplicate();
      await subClient.connect();
      io.adapter(createAdapter(redisClient, subClient));
      logger.server("Socket.io Redis adapter active");
    } catch (err: any) {
      logger.warn(`Socket.io Redis adapter failed — single-process mode: ${err.message}`);
    }
  }

  // Verify JWT on every socket handshake — prevents room hijacking
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Unauthorized"));
    try {
      const payload = jwt.verify(token, jwtConfig.accessSecret) as { id: string };
      (socket as any).userId = payload.id;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId: string = (socket as any).userId;
    logger.info(`Socket connected: ${socket.id} (user: ${userId})`);

    socket.on("join_room", (roomId: string) => {
      // Only allow joining the authenticated user's own room
      if (roomId !== userId) return;
      socket.join(roomId);
      logger.debug(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}
