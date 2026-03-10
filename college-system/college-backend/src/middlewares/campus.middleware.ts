import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { sendForbidden, sendNotFound } from "../utils/response";

/**
 * Attaches campusId to req from query/params and verifies the requesting
 * user has been assigned to that campus (for ADMIN / TEACHER).
 * SUPER_ADMIN bypasses the check and can access any campus.
 */
export const campusMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const campusId =
    (req.params.campusId as string) ||
    (req.query.campusId as string) ||
    (req.body?.campusId as string);

  if (!campusId) {
    next();
    return;
  }

  // Super admin can access any campus
  if (req.user?.role === "SUPER_ADMIN") {
    next();
    return;
  }

  try {
    const campus = await prisma.campus.findUnique({ where: { id: campusId } });
    if (!campus || !campus.isActive) {
      sendNotFound(res, "Campus not found");
      return;
    }

    if (req.user?.role === "ADMIN" || req.user?.role === "TEACHER") {
      const staffProfile = await prisma.staffProfile.findFirst({
        where: { userId: req.user.userId },
      });

      if (!staffProfile) {
        sendForbidden(res, "Staff profile not found");
        return;
      }

      const assignment = await prisma.staffCampusAssignment.findFirst({
        where: { staffId: staffProfile.id, campusId, removedAt: null },
      });

      if (!assignment) {
        sendForbidden(res, "You are not assigned to this campus");
        return;
      }
    }

    next();
  } catch {
    next();
  }
};
