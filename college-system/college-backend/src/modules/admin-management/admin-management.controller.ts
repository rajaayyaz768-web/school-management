import { Request, Response } from "express";
import * as adminMgmtService from "./admin-management.service";
import { sendSuccess, sendCreated, sendError } from "../../utils/response";

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
