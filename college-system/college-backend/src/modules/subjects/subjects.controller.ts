import { Request, Response } from "express";
import * as subjectService from "./subjects.service";
import { sendSuccess, sendCreated, sendError } from "../../utils/response";

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await subjectService.getAllSubjects();
    sendSuccess(res, "Subjects retrieved successfully", subjects);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getSubjectById = async (req: Request, res: Response) => {
  try {
    const subject = await subjectService.getSubjectById(req.params.id as string);
    sendSuccess(res, "Subject retrieved successfully", subject);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const subject = await subjectService.createSubject(req.body);
    sendCreated(res, "Subject created successfully", subject);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  try {
    const subject = await subjectService.updateSubject(req.params.id as string, req.body);
    sendSuccess(res, "Subject updated successfully", subject);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const toggleSubjectStatus = async (req: Request, res: Response) => {
  try {
    const subject = await subjectService.toggleSubjectStatus(req.params.id as string);
    sendSuccess(res, "Subject status toggled successfully", subject);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getAssignmentsBySection = async (req: Request, res: Response) => {
  try {
    const sectionId = req.query.section_id as string;
    if (!sectionId) throw Object.assign(new Error("section_id query required"), { statusCode: 400 });
    const assignments = await subjectService.getAssignmentsBySection(sectionId, (req as any).user);
    sendSuccess(res, "Assignments retrieved successfully", assignments);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getAssignmentsByTeacher = async (req: Request, res: Response) => {
  try {
    const staffId = req.query.teacher_id as string; 
    if (!staffId) throw Object.assign(new Error("teacher_id query required"), { statusCode: 400 });
    const assignments = await subjectService.getAssignmentsByTeacher(staffId);
    sendSuccess(res, "Assignments retrieved successfully", assignments);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getAssignmentsRoot = async (req: Request, res: Response) => {
  if (req.query.section_id) {
    return getAssignmentsBySection(req, res);
  } else if (req.query.teacher_id) {
    return getAssignmentsByTeacher(req, res);
  }
  sendError(res, "Please provide section_id or teacher_id query parameter", 400);
};

export const getMyTeachingAssignments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const staffProfile = await import("../../config/database").then(m =>
      m.default.staffProfile.findUnique({ where: { userId }, select: { id: true } })
    );
    if (!staffProfile) throw Object.assign(new Error("Staff profile not found"), { statusCode: 404 });

    const assignments = await import("../../config/database").then(m =>
      m.default.sectionSubjectTeacher.findMany({
        where: { staffId: staffProfile.id },
        include: {
          subject: true,
          section: {
            include: {
              grade: {
                include: { program: { include: { campus: true } } },
              },
            },
          },
        },
        orderBy: [
          { section: { grade: { displayOrder: "asc" } } },
          { section: { name: "asc" } },
          { subject: { name: "asc" } },
        ],
      })
    );
    sendSuccess(res, "Teaching assignments retrieved", assignments);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = await subjectService.createAssignment(req.body, (req as any).user);
    sendCreated(res, "Assignment created successfully", assignment);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = await subjectService.updateAssignment(req.params.id as string, req.body, (req as any).user);
    sendSuccess(res, "Assignment updated successfully", assignment);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const result = await subjectService.deleteAssignment(req.params.id as string, (req as any).user);
    sendSuccess(res, result.message, null);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};
