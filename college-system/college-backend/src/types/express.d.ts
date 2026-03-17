// Extends Express Request to carry the authenticated user payload
// after the auth middleware verifies the JWT.

import "express";
import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        campusId: string | null;
      };
      campusId: string | null;
    }
  }
}

export { };
