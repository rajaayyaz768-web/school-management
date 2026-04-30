import { Request, Response } from "express";
import * as adminMgmtService from "./admin-management.service";
import { sendSuccess, sendCreated, sendError } from "../../utils/response";
import { DeviceRequestStatus, DeviceStatus } from "@prisma/client";

export const listAdmins = async (_req: Request, res: Response) => {
  try {
    const admins = await adminMgmtService.listAdmins();
    sendSuccess(res, "Admins retrieved successfully", admins);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const admin = await adminMgmtService.createAdmin(req.body);
    sendCreated(res, "Admin created successfully", admin);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

// ── Device Registration Requests ─────────────────────────────────────────────

export const listDeviceRequests = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as DeviceRequestStatus | undefined;
    const requests = await adminMgmtService.listDeviceRequests(status);
    sendSuccess(res, "Device requests retrieved", requests);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getUnreadDeviceRequestCount = async (_req: Request, res: Response) => {
  try {
    const count = await adminMgmtService.countUnreadDeviceRequests();
    sendSuccess(res, "Unread count retrieved", { count });
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const reviewDeviceRequest = async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId as string;
    const { action, note } = req.body;
    const result = await adminMgmtService.reviewDeviceRequest(requestId, action, note);
    sendSuccess(res, `Device request ${action.toLowerCase()}d`, result);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const markDeviceRequestsRead = async (_req: Request, res: Response) => {
  try {
    await adminMgmtService.markDeviceRequestsRead();
    sendSuccess(res, "Requests marked as read", null);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

// ── Registered Devices ───────────────────────────────────────────────────────

export const listAdminDevices = async (req: Request, res: Response) => {
  try {
    const adminId = req.params.adminId as string;
    const devices = await adminMgmtService.listAdminDevices(adminId);
    sendSuccess(res, "Devices retrieved", devices);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const updateRegisteredDevice = async (req: Request, res: Response) => {
  try {
    const deviceId = req.params.deviceId as string;
    const data = req.body as { label?: string; status?: DeviceStatus };
    const device = await adminMgmtService.updateRegisteredDevice(deviceId, data);
    sendSuccess(res, "Device updated", device);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const deleteRegisteredDevice = async (req: Request, res: Response) => {
  try {
    const deviceId = req.params.deviceId as string;
    await adminMgmtService.deleteRegisteredDevice(deviceId);
    sendSuccess(res, "Device removed", null);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

// ── Campus Allowed Networks ───────────────────────────────────────────────────

export const listAllowedNetworks = async (req: Request, res: Response) => {
  try {
    const campusId = req.query.campusId as string;
    if (!campusId) return sendError(res, "campusId is required", 400);
    const networks = await adminMgmtService.listAllowedNetworks(campusId);
    sendSuccess(res, "Networks retrieved", networks);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const createAllowedNetwork = async (req: Request, res: Response) => {
  try {
    const network = await adminMgmtService.createAllowedNetwork(req.body);
    sendCreated(res, "Network rule created", network);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const updateAllowedNetwork = async (req: Request, res: Response) => {
  try {
    const networkId = req.params.networkId as string;
    const network = await adminMgmtService.updateAllowedNetwork(networkId, req.body);
    sendSuccess(res, "Network rule updated", network);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const deleteAllowedNetwork = async (req: Request, res: Response) => {
  try {
    const networkId = req.params.networkId as string;
    await adminMgmtService.deleteAllowedNetwork(networkId);
    sendSuccess(res, "Network rule deleted", null);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};
