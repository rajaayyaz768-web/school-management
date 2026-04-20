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

    if (!decoded || !decoded.userId) {
      sendError(res, "Invalid or expired access token", 401);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    // ─── Campus scope enforcement ───────────────────────────────────────────
    // Express 5 exposes req.query as a getter — direct property assignment is
    // silently dropped. We must use Object.defineProperty to shadow the getter
    // with a plain writable value so downstream controllers read our overrides.
    const overrideQuery = (extra: Record<string, string>) => {
      Object.defineProperty(req, 'query', {
        value: Object.assign(Object.create(null), req.query, extra),
        writable: true,
        configurable: true,
      })
    }

    // ADMIN: must have a campus assignment. Lock all queries to their campus
    // regardless of what the client sends in ?campusId.
    if (user.role === Role.ADMIN) {
      if (!campusId) {
        sendError(res, 'Admin user has no assigned campus. Contact the principal.', 403)
        return
      }
      overrideQuery({ campusId, campus_id: campusId })
    }
    // TEACHER / STUDENT / PARENT: campus scoping is handled at the service layer
    // (SectionSubjectTeacher for sections, /students/me, /parents/my-children).
    // Forcing campus_id here would break multi-campus teacher flows.
    // SUPER_ADMIN: leave req.query.campusId untouched.
    // null = all campuses; a specific id = drill into that campus.

    // Also populate req.campusId for middleware that reads it directly.
    req.campusId = campusId

    next();
  } catch (error) {
    sendError(res, "Unauthorized", 401);
  }
};
