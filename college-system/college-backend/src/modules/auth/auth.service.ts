import prisma from "../../config/database";
import { jwtConfig } from "../../config/jwt";
import { comparePassword } from "../../utils/password";
import { User } from "@prisma/client";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/token";
import { AppError } from "../../middlewares/error.middleware";
import { LoginRequest, LoginResponse, MeResponse, RefreshTokenResponse } from "./auth.types";
import { logger } from "../../utils/logger";
import { hashPassword, comparePassword as verifyPassword } from "../../utils/password";
import { sendRecoveryEmailVerification, sendPasswordResetEmail } from "../../services/email.service";
import { isIpInAnyNetwork } from "../../utils/ipUtils";
import crypto from "crypto";

// Normalise a raw CNIC string to XXXXX-XXXXXXX-X format
function normalizeCnicForLookup(raw: string): string {
  const cleaned = raw.replace(/\s/g, "");
  if (/^\d{13}$/.test(cleaned)) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
  }
  return cleaned;
}

// Resolve email / roll number / CNIC to a User row
async function resolveUserByIdentifier(identifier: string): Promise<User | null> {
  const trimmed = identifier.trim();

  // Email: contains @
  if (trimmed.includes("@")) {
    return prisma.user.findUnique({ where: { email: trimmed.toLowerCase() } });
  }

  // CNIC: matches XXXXX-XXXXXXX-X (with or without dashes, 13 digits)
  const normalized = normalizeCnicForLookup(trimmed);
  if (/^\d{5}-\d{7}-\d$/.test(normalized)) {
    const parent = await prisma.parentProfile.findUnique({
      where: { cnic: normalized },
      include: { user: true },
    });
    return parent?.user ?? null;
  }

  // Roll number: stored uppercase (e.g. BOY-FSPM-1-A-001)
  const student = await prisma.studentProfile.findUnique({
    where: { rollNumber: trimmed.toUpperCase() },
    include: { user: true },
  });
  return student?.user ?? null;
}

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
  const user = await resolveUserByIdentifier(data.identifier);

  // Use same message for missing user and wrong password (prevents enumeration)
  if (!user) {
    logger.auth.loginFailed(data.identifier, 'User not found');
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been disabled. Contact admin.", 403);
  }

  const passwordMatch = await comparePassword(data.password, user.passwordHash);
  if (!passwordMatch) {
    logger.auth.loginFailed(data.identifier, 'Invalid password');
    throw new AppError("Invalid credentials", 401);
  }

  // ── ADMIN security gate: device + network checks ──────────────────────────
  if (user.role === "ADMIN") {
    // 1. Resolve admin's primary campus
    const staffProfile = await prisma.staffProfile.findUnique({
      where: { userId: user.id },
      select: {
        campusAssignments: { where: { isPrimary: true }, select: { campusId: true }, take: 1 },
      },
    });
    const campusId = staffProfile?.campusAssignments[0]?.campusId ?? null;
    if (!campusId) throw new AppError("Admin has no assigned campus", 403);

    // 2. Network check — skip if no networks configured yet (grace mode)
    const networks = await prisma.campusAllowedNetwork.findMany({
      where: { campusId, isActive: true },
      select: { cidr: true },
    });
    if (networks.length > 0) {
      const allowed = isIpInAnyNetwork(data.clientIp ?? "", networks.map((n: { cidr: string }) => n.cidr));
      if (!allowed) {
        throw new AppError("Login not allowed from this network.", 403);
      }
    }

    // 3. Device check
    const registeredDevice = await prisma.registeredDevice.findFirst({
      where: { adminUserId: user.id, deviceToken: data.deviceToken ?? "", status: "ACTIVE" },
    });
    if (!registeredDevice) {
      try {
        await prisma.deviceRegistrationRequest.create({
          data: {
            adminUserId: user.id,
            deviceToken: data.deviceToken ?? "unknown",
            userAgent: data.userAgent,
            requestedFromIp: data.clientIp,
          },
        });
      } catch (err: any) {
        if (err?.code !== "P2002") throw err; // swallow duplicate unique constraint only
      }
      throw new AppError("Device not registered. A request has been sent to the principal.", 403);
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

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

export const updateProfileService = async (
  userId: string,
  role: string,
  firstName: string,
  lastName: string
): Promise<{ fullName: string }> => {
  if (role === "STUDENT") {
    await prisma.studentProfile.update({
      where: { userId },
      data: { firstName, lastName },
    });
  } else if (role === "PARENT") {
    await prisma.parentProfile.update({
      where: { userId },
      data: { firstName, lastName },
    });
  } else {
    await prisma.staffProfile.update({
      where: { userId },
      data: { firstName, lastName },
    });
  }
  return { fullName: `${firstName} ${lastName}` };
};

export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  const match = await verifyPassword(currentPassword, user.passwordHash);
  if (!match) throw new AppError("Current password is incorrect", 400);

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hashed } });

  // Clear the stored temporary password so admin knows teacher set their own
  await prisma.staffProfile.updateMany({
    where: { userId },
    data: { temporaryPassword: null },
  });
};

/* ── Recovery Email: send OTP ─────────────────────────────────────────── */
export const sendRecoveryEmailOtpService = async (
  userId: string,
  recoveryEmail: string
): Promise<void> => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  await prisma.emailOtp.create({
    data: {
      email: recoveryEmail,
      otp: hashedOtp,
      userId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendRecoveryEmailVerification(recoveryEmail, otp);
};

/* ── Recovery Email: verify OTP and save ─────────────────────────────── */
export const verifyAndSaveRecoveryEmailService = async (
  userId: string,
  recoveryEmail: string,
  otp: string
): Promise<void> => {
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  const record = await prisma.emailOtp.findFirst({
    where: {
      userId,
      email: recoveryEmail,
      otp: hashedOtp,
      expiresAt: { gt: new Date() },
      verified: false,
    },
  });

  if (!record) throw new AppError("Invalid or expired OTP", 400);

  await prisma.emailOtp.update({ where: { id: record.id }, data: { verified: true } });
  await prisma.user.update({ where: { id: userId }, data: { recoveryEmail } });
};

/* ── Forgot Password: send OTP to recovery email ─────────────────────── */
export const sendPasswordResetOtpService = async (
  loginEmail: string,
  enteredRecoveryEmail: string
): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email: loginEmail } });

  if (!user) throw new AppError("No account found with this login email", 404);
  if (!user.recoveryEmail) throw new AppError("No recovery email is set for this account. Please contact your administrator.", 400);
  if (user.recoveryEmail.toLowerCase() !== enteredRecoveryEmail.toLowerCase()) {
    throw new AppError("Recovery email does not match our records", 400);
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  await prisma.emailOtp.create({
    data: {
      email: user.recoveryEmail,
      otp: hashedOtp,
      userId: user.id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendPasswordResetEmail(user.recoveryEmail, otp);
};

/* ── Forgot Password: reset with OTP ─────────────────────────────────── */
export const resetPasswordService = async (
  loginEmail: string,
  otp: string,
  newPassword: string
): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email: loginEmail } });
  if (!user || !user.recoveryEmail) throw new AppError("Account not found or no recovery email set", 400);

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  const record = await prisma.emailOtp.findFirst({
    where: {
      userId: user.id,
      email: user.recoveryEmail,
      otp: hashedOtp,
      expiresAt: { gt: new Date() },
      verified: false,
    },
  });

  if (!record) throw new AppError("Invalid or expired OTP", 400);

  await prisma.emailOtp.update({ where: { id: record.id }, data: { verified: true } });

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashed } });
  await prisma.staffProfile.updateMany({ where: { userId: user.id }, data: { temporaryPassword: null } });
};

/* ── Get recovery email (masked) ──────────────────────────────────────── */
export const getRecoveryEmailService = async (userId: string): Promise<{ recoveryEmail: string | null }> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { recoveryEmail: true } });
  return { recoveryEmail: user?.recoveryEmail ?? null };
};

export const cookieOptions = jwtConfig.cookieOptions;
