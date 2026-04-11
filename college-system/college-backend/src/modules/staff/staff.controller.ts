import { Request, Response } from "express";
import * as staffService from "./staff.service";
import { sendSuccess, sendCreated, sendError } from "../../utils/response";

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const filters = {
      campusId: req.query.campus_id as string | undefined,
      employmentType: req.query.employment_type as string | undefined,
      isActive: req.query.is_active !== undefined ? String(req.query.is_active) === "true" : undefined,
    };
    const staff = await staffService.getAllStaff(filters);
    sendSuccess(res, "Staff retrieved successfully", staff);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getStaffById = async (req: Request, res: Response) => {
  try {
    const staff = await staffService.getStaffById(req.params.id as string);
    sendSuccess(res, "Staff retrieved successfully", staff);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const result = await staffService.createStaff(req.body);
    sendCreated(res, "Staff created successfully", result);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const staff = await staffService.updateStaff(req.params.id as string, req.body);
    sendSuccess(res, "Staff updated successfully", staff);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const toggleStaffStatus = async (req: Request, res: Response) => {
  try {
    const result = await staffService.toggleStaffStatus(req.params.id as string);
    sendSuccess(res, "Staff status toggled successfully", result);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getStaffByCampus = async (req: Request, res: Response) => {
  try {
    const staff = await staffService.getStaffByCampus(req.params.campus_id as string);
    sendSuccess(res, "Staff retrieved successfully", staff);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};
