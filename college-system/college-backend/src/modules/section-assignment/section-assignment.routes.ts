import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "@prisma/client";
import {
  getAssignmentData,
  autoAssign,
  confirmAssignment,
  getSectionFillStatus,
} from "./section-assignment.controller";
import { confirmAssignmentSchema } from "./section-assignment.validation";

const router = Router();

router.get(
  "/data",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  getAssignmentData
);

router.post(
  "/auto-assign",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  autoAssign
);

router.post(
  "/confirm",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(confirmAssignmentSchema),
  confirmAssignment
);

router.get(
  "/section-status",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  getSectionFillStatus
);

export const sectionAssignmentRouter = router;
