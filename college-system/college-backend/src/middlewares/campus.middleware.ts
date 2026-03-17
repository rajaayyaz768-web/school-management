import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

/**
 * Extracts and sets `req.campusId` based on the authenticated user.
 * 
 * - If `req.user` doesn't exist, returns 401 Unauthorized.
 * - Extracts `user.campusId` and sets it to `req.campusId`.
 * - SUPER_ADMIN and PARENT roles will typically have a `null` campusId (seeing all/irrelevant specific).
 * 
 * Use this on routes where tracking a user context to a specific campus is useful but not strictly mandatory, 
 * or where a `null` campus indicates global administrative access.
 * 
 * Must be used AFTER `authenticate` middleware.
 */
export const campusMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    sendError(res, "Unauthorized", 401);
    return;
  }

  req.campusId = req.user.campusId ?? null;
  
  next();
};

/**
 * Enforces that the authenticated user explicitly belongs to a specific campus.
 * 
 * - If `req.user` doesn't exist, returns 401 Unauthorized.
 * - If `req.user.campusId` is null, returns 403 Forbidden with message "No campus assigned to this account".
 * - Otherwise sets `req.campusId` to the specific campus ID.
 * 
 * Use this on routes where an action fundamentally requires a specific campus context 
 * (e.g., retrieving resources that *must* be scoped to a campus without allowing global view).
 * 
 * Must be used AFTER `authenticate` middleware.
 */
export const requireCampus = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    sendError(res, "Unauthorized", 401);
    return;
  }

  const campusId = req.user.campusId ?? null;

  if (campusId === null) {
    sendError(res, "No campus assigned to this account", 403);
    return;
  }

  req.campusId = campusId;
  next();
};
