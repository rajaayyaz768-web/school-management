import { Router } from "express";
import multer from "multer";
import { Role } from "@prisma/client";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import {
  validateImportHandler,
  confirmImportHandler,
  downloadCredentialsHandler,
  getImportHistoryHandler,
  downloadTemplateHandler,
} from "./import.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const adminAndAbove = [Role.SUPER_ADMIN, Role.ADMIN];

router.get(
  "/sections/:sectionId/import/template",
  authenticate,
  authorize(...adminAndAbove),
  downloadTemplateHandler
);

router.get(
  "/sections/:sectionId/import/history",
  authenticate,
  authorize(...adminAndAbove),
  getImportHistoryHandler
);

router.post(
  "/sections/:sectionId/import/validate",
  authenticate,
  authorize(...adminAndAbove),
  upload.single("file"),
  validateImportHandler
);

router.post(
  "/sections/:sectionId/import/confirm",
  authenticate,
  authorize(...adminAndAbove),
  confirmImportHandler
);

router.get(
  "/imports/:importId/credentials",
  authenticate,
  authorize(...adminAndAbove),
  downloadCredentialsHandler
);

export { router as importRouter };
