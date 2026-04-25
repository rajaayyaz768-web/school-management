import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { requireCampus } from "../../middlewares/campus.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "@prisma/client";
import { getStatus, createYear, listYears, transitionalPromotion, annualPromotion, getHistory } from "./promotion.controller";
import { createAcademicYearSchema, runTransitionalSchema, runAnnualSchema } from "./promotion.validation";

const router = Router();

const guard = [authenticate, authorize(Role.SUPER_ADMIN, Role.ADMIN), requireCampus];

router.get("/status", ...guard, getStatus);
router.get("/academic-year", ...guard, listYears);
router.post("/academic-year", ...guard, validate(createAcademicYearSchema), createYear);
router.post("/run/transitional", ...guard, validate(runTransitionalSchema), transitionalPromotion);
router.post("/run/annual", ...guard, validate(runAnnualSchema), annualPromotion);
router.get("/history", ...guard, getHistory);

export const promotionRouter = router;
