import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// Extend Error to carry an optional HTTP status code.
// Both `statusCode` (global error handler) and `status` (local controller
// try/catch blocks) are set so callers using either property get the right code.
class AppError extends Error {
  statusCode: number;
  status: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode;
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

  // Map known Prisma error codes to proper HTTP statuses
  let resolvedStatus = statusCode;
  let resolvedMessage = message;
  if (prismaCode === "P2025") {
    resolvedStatus = 404;
    resolvedMessage = "Record not found";
  } else if (prismaCode === "P2002") {
    resolvedStatus = 409;
    resolvedMessage = "A record with this value already exists";
  } else if (prismaCode === "P2003") {
    resolvedStatus = 400;
    resolvedMessage = "Related record not found";
  }

  res.status(resolvedStatus).json({
    success: false,
    message: resolvedMessage,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

