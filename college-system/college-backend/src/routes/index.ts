import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";

const router = Router();

// ─── Auth ──────────────────────────────────────────────────────────────────
router.use("/auth", authRouter);

// Additional module routes will be mounted here in Steps 5–7:
// router.use("/students", studentsRouter);
// router.use("/staff", staffRouter);
// router.use("/campus", campusRouter);
// ... etc.

export default router;
