import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "@prisma/client";
import {
  getGradesByProgram,
  getGradeById,
  updateGrade,
  toggleGradeStatus,
} from "./grades.controller";
import { updateGradeSchema } from "./grades.validation";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  getGradesByProgram
);

router.get(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
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

export const gradesRouter = router;
