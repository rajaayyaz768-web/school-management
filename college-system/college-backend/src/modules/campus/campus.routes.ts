import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "@prisma/client";
import {
  getAllCampuses,
  getCampusById,
  createCampus,
  updateCampus,
  toggleCampusStatus,
} from "./campus.controller";
import {
  createCampusSchema,
  updateCampusSchema,
} from "./campus.validation";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT),
  getAllCampuses
);

router.get(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT),
  getCampusById
);

router.post(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN),
  validate(createCampusSchema),
  createCampus
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(updateCampusSchema),
  updateCampus
);

router.patch(
  "/:id/toggle",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  toggleCampusStatus
);

export const campusRouter = router;
