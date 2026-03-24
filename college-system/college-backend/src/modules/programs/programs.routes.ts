import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "@prisma/client";
import {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  toggleProgramStatus,
} from "./programs.controller";
import {
  createProgramSchema,
  updateProgramSchema,
} from "./programs.validation";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  getAllPrograms
);

router.get(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  getProgramById
);

router.post(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(createProgramSchema),
  createProgram
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(updateProgramSchema),
  updateProgram
);

router.patch(
  "/:id/toggle",
  authenticate,
  authorize(Role.SUPER_ADMIN),
  toggleProgramStatus
);

export const programsRouter = router;
