import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";
import { sendUnauthorized } from "../utils/response";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendUnauthorized(res, "No token provided");
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    sendUnauthorized(res, "Invalid or expired token");
  }
};
