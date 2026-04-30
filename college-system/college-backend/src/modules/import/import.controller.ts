import { Request, Response } from "express";
import * as importService from "./import.service";
import prisma from "../../config/database";
import { sendSuccess, sendCreated, sendError } from "../../utils/response";
import path from "path";

const ALLOWED_EXTENSIONS = new Set([".csv", ".xlsx"]);

export const validateImportHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return sendError(res, "No file uploaded. Send a CSV or XLSX file in the 'file' field.", 400);
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return sendError(res, "Invalid file type. Only .csv and .xlsx files are accepted.", 400);
    }

    const sectionId = req.params.sectionId as string;
    const report = await importService.validateImport(
      sectionId,
      Buffer.from(req.file.buffer),
      req.file.mimetype,
      req.user!.id
    );

    sendSuccess(res, "Validation complete", report);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const confirmImportHandler = async (req: Request, res: Response) => {
  try {
    const sectionId = req.params.sectionId as string;
    const { validationToken, acknowledgeWarnings } = req.body as {
      validationToken: string;
      acknowledgeWarnings: boolean;
    };

    const result = await importService.confirmImport(
      sectionId,
      validationToken,
      acknowledgeWarnings ?? false,
      req.user!.id
    );

    sendCreated(res, "Import complete", result);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const downloadCredentialsHandler = async (req: Request, res: Response) => {
  try {
    const importId = req.params.importId as string;

    const { buffer, filename } = await importService.generateCredentialFile(
      importId,
      req.user!.id,
      req.user!.role
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const getImportHistoryHandler = async (req: Request, res: Response) => {
  try {
    const sectionId = req.params.sectionId as string;
    const history = await importService.getImportHistory(sectionId);
    sendSuccess(res, "Import history retrieved", history);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};

export const downloadTemplateHandler = async (req: Request, res: Response) => {
  try {
    const sectionId = req.params.sectionId as string;

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { grade: { include: { program: { include: { campus: true } } } } },
    });

    if (!section) return sendError(res, "Section not found", 404);

    const campusName = section.grade.program.campus.name;
    const filename = `Import_Template_${section.name}_${campusName}.csv`;

    const header =
      "firstName,lastName,gender,dob,phone,address,fatherName,fatherCnic,guardianPhone,rankingMarks,existingRollNumber,fatherFirstName,fatherLastName,relationship";
    const example1 =
      "Ali,Ahmed,MALE,2005-03-15,03001234567,House 12 Block A,Muhammad Ahmed,35202-1234567-1,03001234567,850,,Muhammad,Ahmed,FATHER";
    const example2 =
      "Sara,Khan,FEMALE,2006-07-22,,,,35202-9876543-2,03009876543,,,Khalid,Khan,FATHER";

    const csv = [header, example1, example2].join("\r\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    sendError(res, err.message || "Internal Server Error", err.statusCode || 500);
  }
};
