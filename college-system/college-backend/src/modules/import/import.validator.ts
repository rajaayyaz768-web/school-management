import { PrismaClient, StudentStatus } from "@prisma/client";
import {
  ImportCsvRow,
  RowIssue,
  RowValidationResult,
  ValidationReport,
} from "./import.types";
import { normalizePhone, normalizeCnic } from "./import.fileParser";

type SectionFull = {
  id: string;
  name: string;
  capacity: number;
  gradeId: string;
  grade: {
    displayOrder: number;
    program: {
      code: string;
      campusId: string;
      campus: { id: string; name: string; code: string };
    };
  };
};

const CNIC_REGEX = /^\d{5}-\d{7}-\d$/;
const PLACEHOLDER_CNIC_REGEX = /^UNKNOWN-[A-Z0-9]+$/;
const VALID_GENDERS = ["MALE", "FEMALE"];
const VALID_RELATIONSHIPS = ["FATHER", "MOTHER", "GUARDIAN"];

export async function validateImportRows(
  rawRows: ImportCsvRow[],
  section: SectionFull,
  prismaClient: PrismaClient
): Promise<Omit<ValidationReport, "validationToken">> {
  // ── Batch pre-loads ──────────────────────────────────────────────────────
  const existingStudentsInSection = await prismaClient.studentProfile.findMany({
    where: { sectionId: section.id, status: StudentStatus.ACTIVE },
    select: { firstName: true, lastName: true },
  });
  const existingNameSet = new Set(
    existingStudentsInSection.map(
      (s) => `${s.firstName.toLowerCase()}|${s.lastName.toLowerCase()}`
    )
  );

  const currentEnrollment = existingStudentsInSection.length;

  const allCnics = [
    ...new Set(
      rawRows
        .map((r) => (r.fatherCnic ? normalizeCnic(r.fatherCnic) : ""))
        .filter(Boolean)
    ),
  ];

  const existingParents = await prismaClient.parentProfile.findMany({
    where: { cnic: { in: allCnics } },
    select: {
      cnic: true,
      firstName: true,
      lastName: true,
      studentLinks: { select: { id: true } },
    },
  });
  const existingParentMap = new Map(
    existingParents.map((p) => [p.cnic!, p])
  );

  // ── Per-row validation ────────────────────────────────────────────────────
  const results: RowValidationResult[] = [];
  const fileNameSet = new Map<string, number[]>(); // name → row numbers
  const fileCnicNameMap = new Map<string, string>(); // cnic → fatherFirstName

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i];
    const rowNum = i + 2; // 1-based, +1 for header row
    const issues: RowIssue[] = [];

    // V1
    const firstName = (raw.firstName ?? "").trim();
    if (!firstName) issues.push({ code: "V1", message: "First name is required", severity: "ERROR" });

    // V2
    const lastName = (raw.lastName ?? "").trim();
    if (!lastName) issues.push({ code: "V2", message: "Last name is required", severity: "ERROR" });

    // V3
    const genderRaw = (raw.gender ?? "").trim().toUpperCase();
    if (!VALID_GENDERS.includes(genderRaw)) {
      issues.push({ code: "V3", message: `Gender must be MALE or FEMALE, got "${raw.gender}"`, severity: "ERROR" });
    }

    // V4
    if (raw.dob) {
      const d = new Date(raw.dob);
      if (isNaN(d.getTime())) {
        issues.push({ code: "V4", message: "Date of birth is not a valid date", severity: "ERROR" });
      } else {
        const now = new Date();
        if (d > now) issues.push({ code: "V4", message: "Date of birth cannot be in the future", severity: "ERROR" });
        const age = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (age < 4 || age > 30) {
          issues.push({ code: "V4", message: `Student age ${Math.floor(age)} is outside the 4–30 year range`, severity: "WARNING" });
        }
      }
    }

    // V5
    const fatherName = (raw.fatherName ?? "").trim();
    if (!fatherName) issues.push({ code: "V5", message: "Father name is required", severity: "ERROR" });

    // V6
    const rawCnic = (raw.fatherCnic ?? "").trim();
    if (!rawCnic) {
      issues.push({ code: "V6", message: "Father CNIC is required", severity: "ERROR" });
    }

    // V7
    const normalizedCnic = rawCnic ? normalizeCnic(rawCnic) : "";
    if (rawCnic && !CNIC_REGEX.test(normalizedCnic) && !PLACEHOLDER_CNIC_REGEX.test(rawCnic)) {
      issues.push({ code: "V7", message: `Invalid CNIC format: "${rawCnic}". Use XXXXX-XXXXXXX-X or UNKNOWN-XXXXX`, severity: "ERROR" });
    }

    // V8
    const rawPhone = (raw.guardianPhone ?? "").trim();
    if (!rawPhone) {
      issues.push({ code: "V8", message: "Guardian phone is required", severity: "ERROR" });
    }

    // V9
    let normalizedPhone = "";
    if (rawPhone) {
      normalizedPhone = normalizePhone(rawPhone);
      if (!/^03\d{9}$/.test(normalizedPhone)) {
        issues.push({ code: "V9", message: `Invalid phone number: "${rawPhone}". Must start with 03 and be 11 digits`, severity: "ERROR" });
      }
    }

    // V10
    const relationship = (raw.relationship ?? "FATHER").trim().toUpperCase();
    if (raw.relationship && !VALID_RELATIONSHIPS.includes(relationship)) {
      issues.push({ code: "V10", message: `Relationship must be FATHER, MOTHER, or GUARDIAN, got "${raw.relationship}"`, severity: "ERROR" });
    }

    // V11
    if (raw.existingRollNumber !== undefined && raw.existingRollNumber.trim() === "") {
      issues.push({ code: "V11", message: "existingRollNumber cannot be empty if column is present — omit it or fill it", severity: "ERROR" });
    }

    // V15 — existing student in section
    if (firstName && lastName) {
      const nameKey = `${firstName.toLowerCase()}|${lastName.toLowerCase()}`;
      if (existingNameSet.has(nameKey)) {
        issues.push({ code: "V15", message: "A student with this name already exists in this section", severity: "WARNING" });
      }
      // Track for V13
      const prev = fileNameSet.get(nameKey) ?? [];
      prev.push(rowNum);
      fileNameSet.set(nameKey, prev);
    }

    // V16/V17 — parent exists
    let parentAction: RowValidationResult["parentAction"] = "UNKNOWN";
    let existingParentName: string | undefined;
    if (normalizedCnic && !issues.some(i => i.code === "V7")) {
      const cnicKey = PLACEHOLDER_CNIC_REGEX.test(rawCnic) ? rawCnic : normalizedCnic;
      if (existingParentMap.has(cnicKey)) {
        const ep = existingParentMap.get(cnicKey)!;
        parentAction = "LINK_EXISTING";
        existingParentName = `${ep.firstName} ${ep.lastName}`;
        issues.push({ code: "V16", message: `Will link to existing parent account: ${existingParentName}`, severity: "INFO" });

        const fatherFirstName = (raw.fatherFirstName ?? "").trim();
        if (fatherFirstName && fatherFirstName.toLowerCase() !== ep.firstName.toLowerCase()) {
          issues.push({
            code: "V17",
            message: `Name mismatch: CSV has "${fatherFirstName}" but existing account is "${ep.firstName}". Existing account will be used unchanged.`,
            severity: "WARNING",
          });
        }
      } else {
        parentAction = "CREATE";
      }

      // Track for V12
      if (fileCnicNameMap.has(cnicKey)) {
        const existingName = fileCnicNameMap.get(cnicKey)!;
        const incoming = (raw.fatherFirstName ?? "").trim().toLowerCase();
        if (incoming && existingName !== incoming) {
          issues.push({
            code: "V12",
            message: `CNIC ${cnicKey} appears with different father names in this file — data conflict`,
            severity: "ERROR",
          });
        }
      } else {
        fileCnicNameMap.set(cnicKey, (raw.fatherFirstName ?? "").trim().toLowerCase());
      }
    }

    // Determine row status
    let status: RowValidationResult["status"] = "READY";
    if (issues.some((i) => i.severity === "ERROR")) status = "ERROR";
    else if (issues.some((i) => i.severity === "WARNING")) status = "WARNING";

    results.push({
      rowNumber: rowNum,
      studentName: `${firstName} ${lastName}`.trim() || `Row ${rowNum}`,
      status,
      issues,
      parentAction,
      existingParentName,
    });
  }

  // ── File-level checks ─────────────────────────────────────────────────────
  // V13 — duplicate names within file
  for (const [, rowNums] of fileNameSet) {
    if (rowNums.length > 1) {
      for (const rn of rowNums) {
        const result = results.find((r) => r.rowNumber === rn);
        if (result && result.status !== "ERROR") {
          result.status = "WARNING";
          result.issues.push({
            code: "V13",
            message: `Duplicate name in this file at rows: ${rowNums.join(", ")}`,
            severity: "WARNING",
          });
        }
      }
    }
  }

  // V14 — capacity check
  const validRows = results.filter((r) => r.status !== "ERROR");
  const projectedTotal = currentEnrollment + validRows.length;
  const wouldExceedCapacity = projectedTotal > section.capacity;
  if (wouldExceedCapacity) {
    const excess = projectedTotal - section.capacity;
    const lastN = validRows.slice(validRows.length - excess);
    for (const row of lastN) {
      if (row.status !== "ERROR") {
        row.status = "WARNING";
        row.issues.push({
          code: "V14",
          message: `Section capacity (${section.capacity}) would be exceeded. This student is in the excess.`,
          severity: "WARNING",
        });
      }
    }
  }

  // ── Aggregates ─────────────────────────────────────────────────────────────
  const readyCount = results.filter((r) => r.status === "READY").length;
  const warningCount = results.filter((r) => r.status === "WARNING").length;
  const errorCount = results.filter((r) => r.status === "ERROR").length;

  const uniqueCreateCnics = new Set(
    results.filter((r) => r.parentAction === "CREATE").map((r) => {
      const raw = rawRows[r.rowNumber - 2];
      return raw.fatherCnic ? normalizeCnic(raw.fatherCnic) : "";
    })
  );
  const uniqueLinkCnics = new Set(
    results.filter((r) => r.parentAction === "LINK_EXISTING").map((r) => {
      const raw = rawRows[r.rowNumber - 2];
      return raw.fatherCnic ? normalizeCnic(raw.fatherCnic) : "";
    })
  );

  let siblingsDetected = 0;
  for (const cnic of uniqueLinkCnics) {
    const ep = existingParentMap.get(cnic);
    if (ep) siblingsDetected += ep.studentLinks.length;
  }

  return {
    sectionId: section.id,
    sectionName: section.name,
    campusName: section.grade.program.campus.name,
    totalRows: rawRows.length,
    readyCount,
    warningCount,
    errorCount,
    newParentsToCreate: uniqueCreateCnics.size,
    existingParentsToLink: uniqueLinkCnics.size,
    siblingsDetected,
    wouldExceedCapacity,
    currentEnrollment,
    sectionCapacity: section.capacity,
    rows: results,
  };
}
