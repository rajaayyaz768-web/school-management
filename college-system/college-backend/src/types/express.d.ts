// Extends Express Request to carry the authenticated user payload
// after the auth middleware verifies the JWT.

import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
        email: string;
      };
    }
  }
}

export {};
