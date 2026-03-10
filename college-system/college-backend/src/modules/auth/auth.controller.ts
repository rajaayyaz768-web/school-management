import { Request, Response } from "express";
import {
  loginService,
  refreshTokenService,
  meService,
  cookieOptions,
} from "./auth.service";
import { jwtConfig } from "../../config/jwt";
import {
  sendSuccess,
  sendUnauthorized,
} from "../../utils/response";
import { logger } from "../../utils/logger";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { loginResponse, refreshToken } = await loginService(req.body);

  res.cookie(jwtConfig.cookieName, refreshToken, cookieOptions);

  logger.info(`User logged in: ${loginResponse.user.email} [${loginResponse.user.role}]`);

  sendSuccess(res, "Login successful", loginResponse);
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const token: string | undefined = req.cookies?.[jwtConfig.cookieName];

  if (!token) {
    sendUnauthorized(res, "Refresh token not provided");
    return;
  }

  const data = await refreshTokenService(token);
  sendSuccess(res, "Token refreshed", data);
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie(jwtConfig.cookieName, { path: "/" });
  logger.info(`User logged out: ${req.user?.email}`);
  sendSuccess(res, "Logged out successfully");
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    sendUnauthorized(res);
    return;
  }
  const data = await meService(req.user.userId);
  sendSuccess(res, "User fetched", data);
};
