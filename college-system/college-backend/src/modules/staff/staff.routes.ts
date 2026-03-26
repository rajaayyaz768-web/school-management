import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "@prisma/client";
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  getStaffByCampus,
} from "./staff.controller";
import {
  createStaffSchema,
  updateStaffSchema,
} from "./staff.validation";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  getAllStaff
);

router.get(
  "/by-campus/:campus_id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER),
  getStaffByCampus
);

router.get(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  getStaffById
);

router.post(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(createStaffSchema),
  createStaff
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(updateStaffSchema),
  updateStaff
);

router.patch(
  "/:id/toggle",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  toggleStaffStatus
);

export const staffRouter = router;
