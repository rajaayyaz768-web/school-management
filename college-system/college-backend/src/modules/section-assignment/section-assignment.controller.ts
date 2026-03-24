import { Request, Response } from "express";
import * as sectionAssignmentService from "./section-assignment.service";
import { sendSuccess, sendCreated, sendError } from "../../utils/response";

export const getAssignmentData = async (req: Request, res: Response) => {
  try {
    const gradeId = req.query.grade_id as string;
    if (!gradeId) {
       sendError(res, "grade_id is required", 400);
       return;
    }
    const data = await sectionAssignmentService.getAssignmentData(gradeId);
    sendSuccess(res, "Assignment context retrieved successfully", data);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const autoAssign = async (req: Request, res: Response) => {
  try {
    const gradeId = req.body.grade_id as string;
    const sectionCapacities = req.body.sectionCapacities || [];
    if (!gradeId) {
       sendError(res, "grade_id is required in body", 400);
       return;
    }
    const preview = await sectionAssignmentService.autoAssign(gradeId, sectionCapacities);
    sendSuccess(res, "Auto assignment preview generated successfully", preview);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const confirmAssignment = async (req: Request, res: Response) => {
  try {
    const result = await sectionAssignmentService.confirmAssignment(req.body);
    sendCreated(res, "Section assignments mapped successfully", result);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getSectionFillStatus = async (req: Request, res: Response) => {
  try {
    const gradeId = req.query.grade_id as string;
    if (!gradeId) {
       sendError(res, "grade_id is required", 400);
       return;
    }
    const statusInfo = await sectionAssignmentService.getSectionFillStatus(gradeId);
    sendSuccess(res, "Section fill metrics retrieved successfully", statusInfo);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};
