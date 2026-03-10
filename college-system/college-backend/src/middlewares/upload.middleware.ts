import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import { AppError } from "./error.middleware";

const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "5", 10);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, process.env.UPLOAD_DIR || "uploads");
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowed = /jpeg|jpg|png|pdf|doc|docx|xlsx|xls/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Only images (jpg/png) and documents (pdf/doc/xlsx) are allowed",
        400
      )
    );
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter,
});

export const uploadSingle = (field: string) => upload.single(field);
export const uploadMultiple = (field: string, max = 5) =>
  upload.array(field, max);
