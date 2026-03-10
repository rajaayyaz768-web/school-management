import { Response } from "express";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Success ────────────────────────────────────────────────────────────────
export const sendSuccess = (
  res: Response,
  message: string,
  data?: unknown,
  statusCode = 200,
  pagination?: PaginationMeta
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
  });
};

// ─── Created ────────────────────────────────────────────────────────────────
export const sendCreated = (
  res: Response,
  message: string,
  data?: unknown
): Response => sendSuccess(res, message, data, 201);

// ─── Error ──────────────────────────────────────────────────────────────────
export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errorCode?: string
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errorCode && { error: errorCode }),
  });
};

// ─── Convenience aliases ─────────────────────────────────────────────────────
export const sendUnauthorized = (res: Response, message = "Unauthorized") =>
  sendError(res, message, 401, "UNAUTHORIZED");

export const sendForbidden = (res: Response, message = "Forbidden") =>
  sendError(res, message, 403, "FORBIDDEN");

export const sendNotFound = (res: Response, message = "Not found") =>
  sendError(res, message, 404, "NOT_FOUND");

export const sendBadRequest = (res: Response, message: string) =>
  sendError(res, message, 400, "BAD_REQUEST");

export const sendValidationError = (res: Response, message: string) =>
  sendError(res, message, 422, "VALIDATION_ERROR");
