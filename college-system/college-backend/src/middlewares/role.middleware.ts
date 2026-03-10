import { Request, Response, NextFunction } from "express";
import { sendForbidden } from "../utils/response";
import { UserRole } from "../types/common.types";

/**
 * Restricts a route to specific roles.
 * Must be used AFTER authMiddleware (req.user must be set).
 *
 * Usage: router.get('/admin-only', authMiddleware, requireRoles('ADMIN', 'SUPER_ADMIN'), handler)
 */
export const requireRoles =
  (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendForbidden(res, "Not authenticated");
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      sendForbidden(
        res,
        `Role '${req.user.role}' does not have access to this resource`
      );
      return;
    }

    next();
  };
