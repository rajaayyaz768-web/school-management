import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "@prisma/client";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  getUnassignedStudents,
  getStudentsBySection,
} from "./students.controller";
import {
  createStudentSchema,
  updateStudentSchema,
} from "./students.validation";

const router = Router();

router.get(
  "/unassigned",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  getUnassignedStudents
);

router.get(
  "/by-section",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER),
  getStudentsBySection
);

router.get(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  getAllStudents
);

router.get(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER),
  getStudentById
);

router.post(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(createStudentSchema),
  createStudent
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(updateStudentSchema),
  updateStudent
);

export const studentsRouter = router;
