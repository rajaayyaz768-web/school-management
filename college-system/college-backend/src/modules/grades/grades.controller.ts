import { Request, Response } from "express";
import * as gradeService from "./grades.service";
import { sendSuccess, sendCreated, sendError } from "../../utils/response";

export const createGrade = async (req: Request, res: Response) => {
  try {
    const grade = await gradeService.createGrade(req.body);
    sendSuccess(res, "Grade created successfully", grade);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

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

export const deleteGrade = async (req: Request, res: Response) => {
  try {
    const result = await gradeService.deleteGrade(req.params.id as string);
    sendSuccess(res, result.message, null);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getSubjectsByGrade = async (req: Request, res: Response) => {
  try {
    const subjects = await gradeService.getSubjectsByGrade(req.params.id as string);
    sendSuccess(res, "Subjects retrieved successfully", subjects);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const addSubjectToGrade = async (req: Request, res: Response) => {
  try {
    const subject = await gradeService.addSubjectToGrade(req.params.id as string, req.body.subjectId as string);
    sendCreated(res, "Subject added to grade", subject);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const removeSubjectFromGrade = async (req: Request, res: Response) => {
  try {
    const result = await gradeService.removeSubjectFromGrade(req.params.id as string, req.params.subjectId as string);
    sendSuccess(res, result.message, null);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};
