import { Request, Response } from "express";
import * as studentsService from "./students.service";
import { sendSuccess, sendCreated, sendError } from "../../utils/response";

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const filters = {
      campusId: req.query.campus_id as string | undefined,
      gradeId: req.query.grade_id as string | undefined,
      sectionId: req.query.section_id as string | undefined,
      status: req.query.status as string | undefined,
    };
    
    const result = await studentsService.getAllStudents(filters, { page, limit });
    sendSuccess(res, "Students retrieved successfully", result);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await studentsService.getStudentById(req.params.id as string);
    sendSuccess(res, "Student retrieved successfully", student);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const result = await studentsService.createStudent(req.body);
    sendCreated(res, "Student created successfully", result);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const student = await studentsService.updateStudent(req.params.id as string, req.body);
    sendSuccess(res, "Student updated successfully", student);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getUnassignedStudents = async (req: Request, res: Response) => {
  try {
    const gradeId = req.query.grade_id as string;
    if (!gradeId) {
       sendError(res, "grade_id is required", 400);
       return;
    }
    const students = await studentsService.getUnassignedStudents(gradeId);
    sendSuccess(res, "Unassigned students retrieved successfully", students);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getStudentsBySection = async (req: Request, res: Response) => {
  try {
    const sectionId = req.query.section_id as string;
    if (!sectionId) {
       sendError(res, "section_id is required", 400);
       return;
    }
    const students = await studentsService.getStudentsBySection(sectionId);
    sendSuccess(res, "Section students retrieved successfully", students);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};
