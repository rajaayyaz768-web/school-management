import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "@prisma/client";
import {
  listAdmins,
  createAdmin,
  listDeviceRequests,
  getUnreadDeviceRequestCount,
  reviewDeviceRequest,
  markDeviceRequestsRead,
  listAdminDevices,
  updateRegisteredDevice,
  deleteRegisteredDevice,
  listAllowedNetworks,
  createAllowedNetwork,
  updateAllowedNetwork,
  deleteAllowedNetwork,
} from "./admin-management.controller";
import {
  createAdminSchema,
  reviewDeviceRequestSchema,
  updateDeviceSchema,
  createNetworkSchema,
  updateNetworkSchema,
} from "./admin-management.validation";

const router = Router();
const guard = [authenticate, authorize(Role.SUPER_ADMIN)];

// ── Admin CRUD ────────────────────────────────────────────────────────────────
router.get("/", ...guard, listAdmins);
router.post("/", ...guard, validate(createAdminSchema), createAdmin);

// ── Device Registration Requests ──────────────────────────────────────────────
router.get("/device-requests", ...guard, listDeviceRequests);
router.get("/device-requests/unread-count", ...guard, getUnreadDeviceRequestCount);
router.patch("/device-requests/:requestId/review", ...guard, validate(reviewDeviceRequestSchema), reviewDeviceRequest);
router.post("/device-requests/mark-read", ...guard, markDeviceRequestsRead);

// ── Registered Devices (per admin) ───────────────────────────────────────────
router.get("/admins/:adminId/devices", ...guard, listAdminDevices);
router.patch("/devices/:deviceId", ...guard, validate(updateDeviceSchema), updateRegisteredDevice);
router.delete("/devices/:deviceId", ...guard, deleteRegisteredDevice);

// ── Campus Allowed Networks ───────────────────────────────────────────────────
router.get("/networks", ...guard, listAllowedNetworks);
router.post("/networks", ...guard, validate(createNetworkSchema), createAllowedNetwork);
router.patch("/networks/:networkId", ...guard, validate(updateNetworkSchema), updateAllowedNetwork);
router.delete("/networks/:networkId", ...guard, deleteAllowedNetwork);

export const adminManagementRouter = router;
