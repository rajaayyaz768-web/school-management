import { Request, Response } from "express";
import {
  loginService,
  refreshTokenService,
  meService,
  updateProfileService,
  changePasswordService,
  sendRecoveryEmailOtpService,
  verifyAndSaveRecoveryEmailService,
  sendPasswordResetOtpService,
  resetPasswordService,
  getRecoveryEmailService,
  cookieOptions,
} from "./auth.service";
import { jwtConfig } from "../../config/jwt";
import {
  sendSuccess,
  sendUnauthorized,
} from "../../utils/response";
import { logger } from "../../utils/logger";

export const login = async (req: Request, res: Response): Promise<void> => {
  const rawDeviceToken = req.headers["x-device-token"];
  const deviceToken = Array.isArray(rawDeviceToken) ? rawDeviceToken[0] : rawDeviceToken;

  const { loginResponse, refreshToken } = await loginService({
    ...req.body,
    deviceToken,
    userAgent: req.get("user-agent"),
    clientIp: req.ip,
  });

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
  const data = await meService(req.user.id);
  sendSuccess(res, "User fetched", data);
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { sendUnauthorized(res); return; }
  const { firstName, lastName } = req.body;
  const data = await updateProfileService(req.user.id, req.user.role, firstName, lastName);
  sendSuccess(res, "Profile updated successfully", data);
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { sendUnauthorized(res); return; }
  const { currentPassword, newPassword } = req.body;
  await changePasswordService(req.user.id, currentPassword, newPassword);
  sendSuccess(res, "Password changed successfully", null);
};

export const getRecoveryEmail = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { sendUnauthorized(res); return; }
  const data = await getRecoveryEmailService(req.user.id);
  sendSuccess(res, "Recovery email fetched", data);
};

export const sendRecoveryEmailOtp = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { sendUnauthorized(res); return; }
  const { recoveryEmail } = req.body;
  await sendRecoveryEmailOtpService(req.user.id, recoveryEmail);
  sendSuccess(res, "OTP sent to recovery email", null);
};

export const verifyRecoveryEmail = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { sendUnauthorized(res); return; }
  const { recoveryEmail, otp } = req.body;
  await verifyAndSaveRecoveryEmailService(req.user.id, recoveryEmail, otp);
  sendSuccess(res, "Recovery email verified and saved", null);
};

export const sendPasswordResetOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, recoveryEmail } = req.body;
  await sendPasswordResetOtpService(email, recoveryEmail);
  sendSuccess(res, "OTP sent to your recovery email", null);
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, otp, newPassword } = req.body;
  await resetPasswordService(email, otp, newPassword);
  sendSuccess(res, "Password reset successfully", null);
};
