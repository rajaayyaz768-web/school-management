import { Request, Response } from "express";
import * as gradeService from "./grades.service";
import { sendSuccess, sendError } from "../../utils/response";

export const getGradesByProgram = async (req: Request, res: Response) => {
  try {
    const programId = req.query.program_id as string;
    if (!programId) {
      throw Object.assign(new Error("program_id query parameter is required"), { statusCode: 400 });
    }
    const grades = await gradeService.getGradesByProgram(programId);
    sendSuccess(res, "Grades retrieved successfully", grades);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getGradeById = async (req: Request, res: Response) => {
  try {
    const grade = await gradeService.getGradeById(req.params.id as string);
    sendSuccess(res, "Grade retrieved successfully", grade);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const updateGrade = async (req: Request, res: Response) => {
  try {
    const grade = await gradeService.updateGrade(req.params.id as string, req.body);
    sendSuccess(res, "Grade updated successfully", grade);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const toggleGradeStatus = async (req: Request, res: Response) => {
  try {
    const grade = await gradeService.toggleGradeStatus(req.params.id as string);
    sendSuccess(res, "Grade status toggled successfully", grade);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};
