import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { sendError } from "../utils/response";

export const Roles = {
  PRINCIPAL_ONLY: [Role.SUPER_ADMIN],
  ADMIN_AND_ABOVE: [Role.SUPER_ADMIN, Role.ADMIN],
  STAFF: [Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER],
  ALL: [Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT],
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Required role(s): ${allowedRoles.join(", ")}`,
        403
      );
      return;
    }

    next();
  };
};
