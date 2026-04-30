import { Router } from "express";
import {
  login, refreshToken, logout, getMe,
  updateProfile, changePassword,
  getRecoveryEmail, sendRecoveryEmailOtp, verifyRecoveryEmail,
  sendPasswordResetOtp, resetPassword,
} from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { authLimiter } from "../../middlewares/rateLimit.middleware";
import {
  loginSchema, updateProfileSchema, changePasswordSchema,
  sendRecoveryOtpSchema, verifyRecoveryEmailSchema,
  sendPasswordResetOtpSchema, resetPasswordSchema,
} from "./auth.validation";

const router = Router();

// POST /api/v1/auth/login
router.post("/login", authLimiter, validate(loginSchema), login);

// POST /api/v1/auth/refresh-token
router.post("/refresh-token", refreshToken);

// POST /api/v1/auth/logout  (protected)
router.post("/logout", authenticate, logout);

// GET /api/v1/auth/me  (protected)
router.get("/me", authenticate, getMe);

// PUT /api/v1/auth/profile  (protected)
router.put("/profile", authenticate, validate(updateProfileSchema), updateProfile);

// PUT /api/v1/auth/password  (protected)
router.put("/password", authenticate, validate(changePasswordSchema), changePassword);

// GET  /api/v1/auth/recovery-email  (protected)
router.get("/recovery-email", authenticate, getRecoveryEmail);

// POST /api/v1/auth/recovery-email/send-otp  (protected)
router.post("/recovery-email/send-otp", authenticate, validate(sendRecoveryOtpSchema), sendRecoveryEmailOtp);

// POST /api/v1/auth/recovery-email/verify  (protected)
router.post("/recovery-email/verify", authenticate, validate(verifyRecoveryEmailSchema), verifyRecoveryEmail);

// POST /api/v1/auth/forgot-password  (public)
router.post("/forgot-password", authLimiter, validate(sendPasswordResetOtpSchema), sendPasswordResetOtp);

// POST /api/v1/auth/reset-password  (public)
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
