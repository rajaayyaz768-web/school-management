import prisma from "../../config/database";
import { jwtConfig } from "../../config/jwt";
import { comparePassword } from "../../utils/password";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/token";
import { AppError } from "../../middlewares/error.middleware";
import { LoginRequest, LoginResponse, MeResponse, RefreshTokenResponse } from "./auth.types";
import { logger } from "../../utils/logger";

// Helper to build the user's full name from their profile
const resolveFullName = async (userId: string, role: string): Promise<string> => {
  if (role === "STUDENT") {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    return profile ? `${profile.firstName} ${profile.lastName}` : "";
  }
  if (role === "PARENT") {
    const profile = await prisma.parentProfile.findUnique({ where: { userId } });
    return profile ? `${profile.firstName} ${profile.lastName}` : "";
  }
  // Staff: SUPER_ADMIN, ADMIN, TEACHER
  const profile = await prisma.staffProfile.findUnique({ where: { userId } });
  return profile ? `${profile.firstName} ${profile.lastName}` : "";
};

export const loginService = async (
  data: LoginRequest
): Promise<{ loginResponse: LoginResponse; refreshToken: string }> => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  // Use same message for missing user and wrong password (prevents email enumeration)
  if (!user) {
    logger.auth.loginFailed(data.email, 'User not found');
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been disabled. Contact admin.", 403);
  }

  const passwordMatch = await comparePassword(data.password, user.passwordHash);
  if (!passwordMatch) {
    logger.auth.loginFailed(data.email, 'Invalid password');
    throw new AppError("Invalid email or password", 401);
  }

  const tokenPayload = { userId: user.id, role: user.role, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const fullName = await resolveFullName(user.id, user.role);

  logger.auth.loginSuccess(user.email, user.role, user.id);

  return {
    refreshToken,
    loginResponse: {
      accessToken,
      user: { id: user.id, email: user.email, role: user.role, fullName },
    },
  };
};

export const refreshTokenService = async (
  token: string
): Promise<RefreshTokenResponse> => {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError("Refresh token is invalid or expired", 401);
  }

  // Ensure user still exists and is active
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) {
    throw new AppError("User not found or disabled", 401);
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  return { accessToken };
};

export const meService = async (userId: string): Promise<MeResponse> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  const fullName = await resolveFullName(user.id, user.role);

  return { id: user.id, email: user.email, role: user.role, fullName };
};

export const cookieOptions = jwtConfig.cookieOptions;
