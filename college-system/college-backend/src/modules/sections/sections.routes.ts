import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "@prisma/client";
import {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
  toggleSectionStatus,
  getSectionStudentCount,
} from "./sections.controller";
import {
  createSectionSchema,
  updateSectionSchema,
} from "./sections.validation";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER),
  getAllSections
);

router.get(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER),
  getSectionById
);

router.get(
  "/:id/student-count",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  getSectionStudentCount
);

router.post(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(createSectionSchema),
  createSection
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(updateSectionSchema),
  updateSection
);

router.patch(
  "/:id/toggle",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  toggleSectionStatus
);

export const sectionsRouter = router;
