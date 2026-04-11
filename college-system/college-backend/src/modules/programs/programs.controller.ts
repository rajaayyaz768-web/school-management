import { Request, Response } from "express";
import * as programService from "./programs.service";
import {
  sendSuccess,
  sendCreated,
  sendError,
} from "../../utils/response";

export const getAllPrograms = async (req: Request, res: Response) => {
  try {
    const campusId = req.query.campus_id as string | undefined;
    const programs = await programService.getAllPrograms(campusId);
    sendSuccess(res, "Programs retrieved successfully", programs);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getProgramById = async (req: Request, res: Response) => {
  try {
    const program = await programService.getProgramById(req.params.id as string);
    sendSuccess(res, "Program retrieved successfully", program);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const createProgram = async (req: Request, res: Response) => {
  try {
    const program = await programService.createProgram(req.body);
    sendCreated(res, "Program created successfully", program);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const updateProgram = async (req: Request, res: Response) => {
  try {
    const program = await programService.updateProgram(req.params.id as string, req.body);
    sendSuccess(res, "Program updated successfully", program);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const toggleProgramStatus = async (req: Request, res: Response) => {
  try {
    const program = await programService.toggleProgramStatus(req.params.id as string);
    sendSuccess(res, "Program status toggled successfully", program);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};
