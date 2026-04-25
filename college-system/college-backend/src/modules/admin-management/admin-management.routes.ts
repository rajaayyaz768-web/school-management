import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "@prisma/client";
import { listAdmins, createAdmin } from "./admin-management.controller";
import { createAdminSchema } from "./admin-management.validation";

const router = Router();

router.get("/", authenticate, authorize(Role.SUPER_ADMIN), listAdmins);
router.post("/", authenticate, authorize(Role.SUPER_ADMIN), validate(createAdminSchema), createAdmin);

export const adminManagementRouter = router;
