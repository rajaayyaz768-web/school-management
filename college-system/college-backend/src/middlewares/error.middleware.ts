import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// Extend Error to carry an optional HTTP status code
class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export { AppError };

// Global error handler — must have 4 params so Express recognises it
export const errorMiddleware = (
  err: AppError | Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const statusCode = (err as AppError).statusCode ?? 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message || "Something went wrong";

  // Log the error with full context
  logger.error(`[${req.method}] ${req.path} — ${err.message}`, {
    stack: err.stack,
    statusCode,
  });

  // Check for Prisma errors and log them with diagnosis
  const prismaCode = (err as any)?.code;
  if (prismaCode) {
    logger.db.error('PrismaError', req.originalUrl, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

