import { Request, Response } from "express";
import * as parentsService from "./parents.service";
import { sendSuccess, sendCreated, sendError } from "../../utils/response";

export const getAllParents = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const parents = await parentsService.getAllParents({ search });
    sendSuccess(res, "Parents retrieved successfully", parents);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getParentById = async (req: Request, res: Response) => {
  try {
    const parent = await parentsService.getParentById(req.params.id);
    sendSuccess(res, "Parent retrieved successfully", parent);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getParentByStudentId = async (req: Request, res: Response) => {
  try {
    const studentId = req.query.student_id as string;
    if (!studentId) {
      sendError(res, "student_id is required", 400);
      return;
    }
    const parents = await parentsService.getParentByStudentId(studentId);
    sendSuccess(res, "Parents for student retrieved successfully", parents);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const createParent = async (req: Request, res: Response) => {
  try {
    const result = await parentsService.createParent(req.body);
    sendCreated(res, "Parent profile created successfully", result);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const updateParent = async (req: Request, res: Response) => {
  try {
    const parent = await parentsService.updateParent(req.params.id, req.body);
    sendSuccess(res, "Parent updated successfully", parent);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const linkStudent = async (req: Request, res: Response) => {
  try {
    const parentId = req.params.id;
    const link = await parentsService.linkStudentToParent(parentId, req.body);
    sendCreated(res, "Student linked to parent successfully", link);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const unlinkStudent = async (req: Request, res: Response) => {
  try {
    const parentId = req.params.id;
    const studentId = req.params.studentId;
    const result = await parentsService.unlinkStudentFromParent(parentId, studentId);
    sendSuccess(res, "Student unlinked successfully", result);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};
