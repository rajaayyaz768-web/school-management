import { Request, Response } from "express";
import * as service from "./promotion.service";
import { sendSuccess, sendCreated, sendError } from "../../utils/response";

export const getStatus = async (req: Request, res: Response) => {
  try {
    const data = await service.getPromotionStatus(req.campusId!);
    sendSuccess(res, "Promotion status retrieved", data);
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const createYear = async (req: Request, res: Response) => {
  try {
    const data = await service.createAcademicYear(req.campusId!, req.body.name);
    sendCreated(res, "Academic year created", data);
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const listYears = async (req: Request, res: Response) => {
  try {
    const data = await service.listAcademicYears(req.campusId!);
    sendSuccess(res, "Academic years retrieved", data);
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const transitionalPromotion = async (req: Request, res: Response) => {
  try {
    const data = await service.runTransitionalPromotion(req.campusId!, req.user!.id, req.body);
    sendCreated(res, "Transitional promotion completed", data);
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const annualPromotion = async (req: Request, res: Response) => {
  try {
    const data = await service.runAnnualPromotion(req.campusId!, req.user!.id, req.body);
    sendCreated(res, "Annual promotion completed", data);
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const data = await service.getPromotionHistory(req.campusId!);
    sendSuccess(res, "Promotion history retrieved", data);
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};
