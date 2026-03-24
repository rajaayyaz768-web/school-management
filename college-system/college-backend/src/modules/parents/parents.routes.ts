import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "@prisma/client";
import {
  getAllParents,
  getParentById,
  getParentByStudentId,
  createParent,
  updateParent,
  linkStudent,
  unlinkStudent,
} from "./parents.controller";
import {
  createParentSchema,
  updateParentSchema,
  linkStudentSchema,
} from "./parents.validation";

const router = Router();

router.get(
  "/by-student",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER),
  getParentByStudentId
);

router.get(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  getAllParents
);

router.get(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  getParentById
);

router.post(
  "/",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(createParentSchema),
  createParent
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(updateParentSchema),
  updateParent
);

router.post(
  "/:id/link-student",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(linkStudentSchema),
  linkStudent
);

router.delete(
  "/:id/unlink-student/:studentId",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  unlinkStudent
);

export const parentsRouter = router;
