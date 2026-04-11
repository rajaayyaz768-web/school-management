import { Request, Response } from "express";
import * as campusService from "./campus.service";
import {
  sendSuccess,
  sendCreated,
  sendError,
} from "../../utils/response";

export const getAllCampuses = async (req: Request, res: Response) => {
  try {
    const campuses = await campusService.getAllCampuses();
    sendSuccess(res, "Campuses retrieved successfully", campuses);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    console.error("[Campus Controller Error - getAllCampuses]:", err);
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getCampusById = async (req: Request, res: Response) => {
  try {
    const campus = await campusService.getCampusById(req.params.id as string);
    sendSuccess(res, "Campus retrieved successfully", campus);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    console.error("[Campus Controller Error - getCampusById]:", err);
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const createCampus = async (req: Request, res: Response) => {
  try {
    const campus = await campusService.createCampus(req.body);
    sendCreated(res, "Campus created successfully", campus);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const updateCampus = async (req: Request, res: Response) => {
  try {
    const campus = await campusService.updateCampus(req.params.id as string, req.body);
    sendSuccess(res, "Campus updated successfully", campus);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const toggleCampusStatus = async (req: Request, res: Response) => {
  try {
    const campus = await campusService.toggleCampusStatus(req.params.id as string);
    sendSuccess(res, "Campus status toggled successfully", campus);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};
