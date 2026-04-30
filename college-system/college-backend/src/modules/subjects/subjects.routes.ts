import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "@prisma/client";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  toggleSubjectStatus,
  getAssignmentsRoot,
  getMyTeachingAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "./subjects.controller";
import {
  createSubjectSchema,
  updateSubjectSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
} from "./subjects.validation";

const router = Router();

// ─── ASSIGNMENT ROUTES (Nested) ──────────────────────────────────────────────────
router.get(
  "/assignments/mine",
  authenticate,
  authorize(Role.TEACHER),
  getMyTeachingAssignments
);

router.get(
  "/assignments",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER),
  getAssignmentsRoot
);

router.post(
  "/assignments",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(createAssignmentSchema),
  createAssignment
);

router.put(
  "/assignments/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(updateAssignmentSchema),
  updateAssignment
);

router.delete(
  "/assignments/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  deleteAssignment
);

// ─── SUBJECT MASTER LIST ROUTES ──────────────────────────────────────────────────
router.get(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER),
  getAllSubjects
);

router.get(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER),
  getSubjectById
);

router.post(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(createSubjectSchema),
  createSubject
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(updateSubjectSchema),
  updateSubject
);

router.patch(
  "/:id/toggle",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  toggleSubjectStatus
);

export const subjectsRouter = router;
