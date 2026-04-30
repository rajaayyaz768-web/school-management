import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "@prisma/client";
import {
  createGrade,
  getGradesByProgram,
  getGradeById,
  updateGrade,
  toggleGradeStatus,
  deleteGrade,
  getSubjectsByGrade,
  addSubjectToGrade,
  removeSubjectFromGrade,
} from "./grades.controller";
import { createGradeSchema, updateGradeSchema } from "./grades.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(createGradeSchema),
  createGrade
);

router.get(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT),
  getGradesByProgram
);

router.get(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT),
  getGradeById
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(updateGradeSchema),
  updateGrade
);

router.patch(
  "/:id/toggle",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  toggleGradeStatus
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  deleteGrade
);

// ─── GRADE CURRICULUM (subjects linked to a grade) ───────────────────────────
router.get(
  "/:id/subjects",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER),
  getSubjectsByGrade
);

router.post(
  "/:id/subjects",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  addSubjectToGrade
);

router.delete(
  "/:id/subjects/:subjectId",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  removeSubjectFromGrade
);

export const gradesRouter = router;
