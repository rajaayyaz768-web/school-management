import ExcelJS from "exceljs";
import { Readable } from "stream";
import type { ImportCsvRow } from "./import.types";

const REQUIRED_HEADERS = [
  "firstName", "lastName", "gender",
  "fatherName", "fatherCnic", "guardianPhone",
  "fatherFirstName", "fatherLastName",
];

const HEADER_ALIASES: Record<string, string> = {
  firstname: "firstName",
  lastname: "lastName",
  gender: "gender",
  dob: "dob",
  phone: "phone",
  address: "address",
  fathername: "fatherName",
  fathercnic: "fatherCnic",
  guardianphone: "guardianPhone",
  rankingmarks: "rankingMarks",
  existingrollnumber: "existingRollNumber",
  fatherfirstname: "fatherFirstName",
  fatherlastname: "fatherLastName",
  relationship: "relationship",
};

function normalizeHeader(raw: string): string {
  return HEADER_ALIASES[raw.toLowerCase().replace(/[\s_-]/g, "")] ?? raw;
}

function cellToString(cell: ExcelJS.Cell): string {
  if (cell.value === null || cell.value === undefined) return "";
  if (typeof cell.value === "object" && "result" in cell.value) {
    return String((cell.value as ExcelJS.CellFormulaValue).result ?? "").trim();
  }
  return String(cell.value).trim();
}

export async function parseUploadedFile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buffer: any,
  mimetype: string
): Promise<ImportCsvRow[]> {
  const workbook = new ExcelJS.Workbook();

  // Convert whatever multer gives us into a plain Node Buffer / Uint8Array
  const rawBytes: Uint8Array =
    buffer instanceof Uint8Array ? buffer : Buffer.from(buffer as ArrayBuffer);

  if (mimetype === "text/csv" || mimetype === "application/csv") {
    const { Readable } = await import("stream");
    const stream = Readable.from(rawBytes);
    await workbook.csv.read(stream);
  } else {
    // exceljs xlsx.load accepts Buffer / ArrayBuffer
    await (workbook.xlsx as ExcelJS.Xlsx & { load: (buf: Uint8Array) => Promise<ExcelJS.Workbook> }).load(rawBytes);
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw Object.assign(new Error("The uploaded file has no worksheet"), { statusCode: 400 });
  }

  // Build header map from first row
  const headerRow = worksheet.getRow(1);
  const headerMap: Record<number, string> = {};
  headerRow.eachCell({ includeEmpty: false }, (cell, colNum) => {
    const normalized = normalizeHeader(cellToString(cell));
    headerMap[colNum] = normalized;
  });

  const presentHeaders = Object.values(headerMap);
  const missingHeaders = REQUIRED_HEADERS.filter(h => !presentHeaders.includes(h));
  if (missingHeaders.length > 0) {
    throw Object.assign(
      new Error(`Missing required columns: ${missingHeaders.join(", ")}`),
      { statusCode: 400 }
    );
  }

  const rows: ImportCsvRow[] = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const record: Record<string, string> = {};
    let hasData = false;

    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      const header = headerMap[colNum];
      if (!header) return;
      const value = cellToString(cell);
      if (value) hasData = true;
      record[header] = value;
    });

    if (!hasData) return; // skip empty rows

    rows.push({
      firstName: record.firstName,
      lastName: record.lastName,
      gender: record.gender,
      dob: record.dob || undefined,
      phone: record.phone || undefined,
      address: record.address || undefined,
      fatherName: record.fatherName,
      fatherCnic: record.fatherCnic,
      guardianPhone: record.guardianPhone,
      rankingMarks: record.rankingMarks || undefined,
      existingRollNumber: record.existingRollNumber || undefined,
      fatherFirstName: record.fatherFirstName,
      fatherLastName: record.fatherLastName,
      relationship: record.relationship || undefined,
    });
  });

  return rows;
}

export function normalizePhone(raw: string): string {
  let cleaned = raw.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+92")) cleaned = "0" + cleaned.slice(3);
  else if (cleaned.startsWith("92") && cleaned.length === 12) cleaned = "0" + cleaned.slice(2);
  return cleaned;
}

export function normalizeCnic(raw: string): string {
  const cleaned = raw.replace(/\s/g, "");
  // If 13 raw digits, insert dashes
  if (/^\d{13}$/.test(cleaned)) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
  }
  return cleaned;
}
