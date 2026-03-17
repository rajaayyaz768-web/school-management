import { Router } from "express";
import { login, refreshToken, logout, getMe } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { authLimiter } from "../../middlewares/rateLimit.middleware";
import { loginSchema } from "./auth.validation";

const router = Router();

// POST /api/v1/auth/login
router.post("/login", authLimiter, validate(loginSchema), login);

// POST /api/v1/auth/refresh-token
router.post("/refresh-token", refreshToken);

// POST /api/v1/auth/logout  (protected)
router.post("/logout", authenticate, logout);

// GET /api/v1/auth/me  (protected)
router.get("/me", authenticate, getMe);

export default router;
