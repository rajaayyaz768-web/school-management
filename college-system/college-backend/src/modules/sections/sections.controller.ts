import { Request, Response } from "express";
import * as sectionService from "./sections.service";
import { sendSuccess, sendCreated, sendError } from "../../utils/response";

export const getAllSections = async (req: Request, res: Response) => {
  try {
    const filters = {
      gradeId: req.query.grade_id as string | undefined,
      campusId: req.query.campus_id as string | undefined,
      academicYear: req.query.academic_year as string | undefined,
    };
    const sections = await sectionService.getAllSections(filters, req.user!);
    sendSuccess(res, "Sections retrieved successfully", sections);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getSectionById = async (req: Request, res: Response) => {
  try {
    const section = await sectionService.getSectionById(req.params.id as string, (req as any).user);
    sendSuccess(res, "Section retrieved successfully", section);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const createSection = async (req: Request, res: Response) => {
  try {
    const section = await sectionService.createSection(req.body, (req as any).user);
    sendCreated(res, "Section created successfully", section);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const updateSection = async (req: Request, res: Response) => {
  try {
    const section = await sectionService.updateSection(req.params.id as string, req.body, (req as any).user);
    sendSuccess(res, "Section updated successfully", section);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const toggleSectionStatus = async (req: Request, res: Response) => {
  try {
    const section = await sectionService.toggleSectionStatus(req.params.id as string, (req as any).user);
    sendSuccess(res, "Section status toggled successfully", section);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getSectionStudentCount = async (req: Request, res: Response) => {
  try {
    const data = await sectionService.getSectionStudentCount(req.params.id as string, (req as any).user);
    sendSuccess(res, "Student count retrieved successfully", data);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};
