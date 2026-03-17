import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";
import { sendError } from "../utils/response";
import prisma from "../config/database";
import { Role } from "@prisma/client";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const token = authHeader.split(" ")[1];

    let decoded: any;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      sendError(res, "Invalid or expired access token", 401);
      return;
    }

    if (!decoded || !decoded.id) {
      sendError(res, "Invalid or expired access token", 401);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        staffProfile: { select: { campusAssignments: { where: { isPrimary: true }, select: { campusId: true } } } },
        studentProfile: { select: { campusId: true } },
        parentProfile: { select: { id: true } }
      }
    });

    if (!user || !user.isActive) {
      sendError(res, "Account not found or deactivated", 401);
      return;
    }

    let campusId: string | null = null;
    if (user.staffProfile) {
      campusId = user.staffProfile.campusAssignments[0]?.campusId ?? null;
    } else if (user.studentProfile) {
      campusId = user.studentProfile.campusId;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      campusId
    };

    next();
  } catch (error) {
    sendError(res, "Unauthorized", 401);
  }
};
