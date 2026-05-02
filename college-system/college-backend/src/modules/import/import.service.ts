import crypto from "crypto";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
import { Role, StudentStatus, Relationship, Gender } from "@prisma/client";
import prisma from "../../config/database";
import { parseUploadedFile, normalizePhone, normalizeCnic } from "./import.fileParser";
import { validateImportRows } from "./import.validator";
import { ImportCsvRow, ValidationReport, ImportResult, ImportHistoryRecord } from "./import.types";
import { sendCredentialsWhatsApp } from "../../services/whatsapp/metaClient";
import { logger } from "../../utils/logger";

// ── In-memory cache ────────────────────────────────────────────────────────────
interface CacheEntry {
  report: ValidationReport;
  rawRows: ImportCsvRow[];
  expiresAt: number;
}
const validationCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000;

function purgeExpired() {
  const now = Date.now();
  for (const [key, entry] of validationCache) {
    if (entry.expiresAt < now) validationCache.delete(key);
  }
}

const VALID_RELATIONSHIPS_SET = new Set<Relationship>(
  Object.values(Relationship)
);

// ── Helper: find a unique email within a Prisma interactive transaction ────────
async function generateUniqueEmail(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  base: string
): Promise<string> {
  const safeBase = base.replace(/[^a-z0-9.]/g, "") || "student";
  let suffix = 0;
  while (true) {
    const candidate =
      suffix === 0 ? `${safeBase}@school.edu` : `${safeBase}${suffix}@school.edu`;
    const exists = await tx.user.findUnique({
      where: { email: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    suffix++;
  }
}

function generateTempPassword(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// validateImport — Phase 1, no DB writes
// ─────────────────────────────────────────────────────────────────────────────
export const validateImport = async (
  sectionId: string,
  fileBuffer: Buffer,
  mimetype: string,
  _userId: string,
  campusId?: string
): Promise<ValidationReport> => {
  purgeExpired();

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { grade: { include: { program: { include: { campus: true } } } } },
  });
  if (!section) throw Object.assign(new Error("Section not found"), { statusCode: 404 });

  if (campusId && section.grade.program.campusId !== campusId) {
    throw Object.assign(
      new Error("The selected section does not belong to your campus. Switch the campus and try again."),
      { statusCode: 403 }
    );
  }

  const rawRows = await parseUploadedFile(fileBuffer, mimetype);
  if (rawRows.length === 0) {
    throw Object.assign(new Error("The uploaded file contains no data rows"), { statusCode: 400 });
  }

  const reportBase = await validateImportRows(rawRows, section, prisma);

  const validationToken = crypto
    .createHash("sha256")
    .update(JSON.stringify(reportBase) + Date.now().toString())
    .digest("hex");

  const report: ValidationReport = { ...reportBase, validationToken };

  validationCache.set(validationToken, {
    report,
    rawRows,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return report;
};

// ─────────────────────────────────────────────────────────────────────────────
// confirmImport — Phase 2, single transaction
// ─────────────────────────────────────────────────────────────────────────────
export const confirmImport = async (
  sectionId: string,
  validationToken: string,
  acknowledgeWarnings: boolean,
  userId: string,
  campusId?: string
): Promise<ImportResult> => {
  purgeExpired();

  const cached = validationCache.get(validationToken);
  if (!cached || cached.expiresAt < Date.now()) {
    throw Object.assign(
      new Error("Validation expired. Please re-upload the file and validate again."),
      { statusCode: 400 }
    );
  }

  const { report, rawRows } = cached;

  if (report.sectionId !== sectionId) {
    throw Object.assign(
      new Error("Section mismatch — validate and confirm must use the same section"),
      { statusCode: 400 }
    );
  }

  const errorRows = report.rows.filter((r) => r.status === "ERROR");
  if (errorRows.length > 0) {
    throw Object.assign(
      new Error(`Cannot import: ${errorRows.length} row(s) have errors. Fix the file and re-validate.`),
      { statusCode: 422 }
    );
  }

  const warningRows = report.rows.filter((r) => r.status === "WARNING");
  if (warningRows.length > 0 && !acknowledgeWarnings) {
    throw Object.assign(
      new Error(`Import has ${warningRows.length} warning(s). Pass acknowledgeWarnings: true to proceed.`),
      { statusCode: 422 }
    );
  }

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { grade: { include: { program: { include: { campus: true } } } } },
  });
  if (!section) throw Object.assign(new Error("Section not found"), { statusCode: 404 });

  if (campusId && section.grade.program.campusId !== campusId) {
    throw Object.assign(
      new Error("The selected section does not belong to your campus. Switch the campus and try again."),
      { statusCode: 403 }
    );
  }

  // Filter to valid rows only (READY + WARNING), preserving original index
  const validIndexes = report.rows
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => r.status !== "ERROR")
    .map(({ i }) => i);
  const validRawRows = validIndexes.map((i) => rawRows[i]);

  // Step A — Roll number mode
  const hasExistingRolls = validRawRows.some((r) => r.existingRollNumber?.trim());
  const hasNewRolls = validRawRows.some((r) => !r.existingRollNumber?.trim());
  if (hasExistingRolls && hasNewRolls) {
    throw Object.assign(
      new Error("Mixed roll numbers: all rows must either have existingRollNumber or none."),
      { statusCode: 422 }
    );
  }
  const useExistingRolls = hasExistingRolls;

  const result = await prisma.$transaction(
    async (tx) => {
      const studentIds: string[] = [];
      const credentialsToCreate: { userId: string; plainTextPassword: string }[] = [];
      const studentCnicMap: { studentId: string; cnic: string; relationship: Relationship }[] = [];

      // ── Step B: Create students ──────────────────────────────────────────
      for (const raw of validRawRows) {
        const tempPwd = generateTempPassword();
        const pwHash = await bcrypt.hash(tempPwd, 10);

        const fn = (raw.firstName ?? "").trim().toLowerCase();
        const ln = (raw.lastName ?? "").trim().toLowerCase();
        const email = await generateUniqueEmail(tx, `${fn}.${ln}`);

        const user = await tx.user.create({
          data: { email, passwordHash: pwHash, role: Role.STUDENT },
        });

        const gender = (raw.gender ?? "MALE").trim().toUpperCase() as Gender;
        const cnic = raw.fatherCnic ? normalizeCnic(raw.fatherCnic) : "";
        const phone = raw.guardianPhone ? normalizePhone(raw.guardianPhone) : null;

        const sp = await tx.studentProfile.create({
          data: {
            userId: user.id,
            sectionId: section.id,
            campusId: section.grade.program.campusId,
            gradeId: section.gradeId,
            status: StudentStatus.ACTIVE,
            firstName: (raw.firstName ?? "").trim(),
            lastName: (raw.lastName ?? "").trim(),
            gender,
            dob: raw.dob ? new Date(raw.dob) : null,
            phone: raw.phone ? normalizePhone(raw.phone) : null,
            address: raw.address ?? null,
            fatherName: (raw.fatherName ?? "").trim() || null,
            fatherCnic: cnic || null,
            guardianPhone: phone,
            rankingMarks: raw.rankingMarks ? parseFloat(raw.rankingMarks) : null,
            rollNumber: null,
          },
        });

        studentIds.push(sp.id);
        credentialsToCreate.push({ userId: user.id, plainTextPassword: tempPwd });

        const relRaw = ((raw.relationship ?? "FATHER").trim().toUpperCase()) as Relationship;
        studentCnicMap.push({
          studentId: sp.id,
          cnic: cnic || raw.fatherCnic || "",
          relationship: VALID_RELATIONSHIPS_SET.has(relRaw) ? relRaw : Relationship.FATHER,
        });
      }

      // ── Step C: Create / link parents ────────────────────────────────────
      let parentsCreated = 0;
      let parentsLinked = 0;
      let siblingsLinked = 0;

      const parentIdByCnic = new Map<string, string>();
      const uniqueCnics = [...new Set(studentCnicMap.map((s) => s.cnic).filter(Boolean))];

      for (const cnic of uniqueCnics) {
        const existingParent = await tx.parentProfile.findFirst({ where: { cnic } });

        if (existingParent) {
          parentIdByCnic.set(cnic, existingParent.id);
          parentsLinked++;
          const existingLinks = await tx.studentParentLink.count({
            where: { parentId: existingParent.id },
          });
          siblingsLinked += existingLinks;
        } else {
          const refIdx = validRawRows.findIndex(
            (r) => (r.fatherCnic ? normalizeCnic(r.fatherCnic) : r.fatherCnic) === cnic
          );
          const refRow = refIdx >= 0 ? validRawRows[refIdx] : null;

          const tempPwd = generateTempPassword();
          const pwHash = await bcrypt.hash(tempPwd, 10);
          const fn = (refRow?.fatherFirstName ?? "parent").trim().toLowerCase();
          const ln = (refRow?.fatherLastName ?? "").trim().toLowerCase();
          const email = await generateUniqueEmail(tx, `${fn}.${ln}`);

          const parentUser = await tx.user.create({
            data: { email, passwordHash: pwHash, role: Role.PARENT },
          });

          const parentProfile = await tx.parentProfile.create({
            data: {
              userId: parentUser.id,
              firstName: (refRow?.fatherFirstName ?? "").trim(),
              lastName: (refRow?.fatherLastName ?? "").trim(),
              cnic,
              phone: refRow?.guardianPhone ? normalizePhone(refRow.guardianPhone) : null,
            },
          });

          parentIdByCnic.set(cnic, parentProfile.id);
          credentialsToCreate.push({ userId: parentUser.id, plainTextPassword: tempPwd });
          parentsCreated++;
        }
      }

      // Link students to parents
      for (const { studentId, cnic, relationship } of studentCnicMap) {
        const parentId = parentIdByCnic.get(cnic);
        if (!parentId) continue;

        const exists = await tx.studentParentLink.findUnique({
          where: { studentId_parentId: { studentId, parentId } },
        });
        if (!exists) {
          await tx.studentParentLink.updateMany({
            where: { studentId, isPrimary: true },
            data: { isPrimary: false },
          });
          await tx.studentParentLink.create({
            data: { studentId, parentId, relationship, isPrimary: true },
          });
        }
      }

      // ── Step D: Roll numbers ─────────────────────────────────────────────
      const campusCode = section.grade.program.campus.code;
      const programCode = section.grade.program.code;
      const gradeOrder = section.grade.displayOrder;
      const secName = section.name;

      if (useExistingRolls) {
        for (let i = 0; i < validRawRows.length; i++) {
          const roll = (validRawRows[i].existingRollNumber ?? "").trim();
          if (roll) {
            await tx.studentProfile.update({
              where: { id: studentIds[i] },
              data: { rollNumber: roll },
            });
          }
        }
      } else {
        // Find the highest sequence number already assigned in this section
        // so new students continue from where the last import left off.
        const existingWithRolls = await tx.studentProfile.findMany({
          where: {
            sectionId: section.id,
            status: StudentStatus.ACTIVE,
            rollNumber: { not: null },
            id: { notIn: studentIds },
          },
          select: { rollNumber: true },
        });
        let maxSeq = 0;
        for (const s of existingWithRolls) {
          const tail = parseInt(s.rollNumber!.split("-").pop()!, 10);
          if (!isNaN(tail) && tail > maxSeq) maxSeq = tail;
        }

        // Sort only the newly imported students alphabetically, then assign
        // roll numbers continuing from maxSeq + 1.
        const newStudents = await tx.studentProfile.findMany({
          where: { id: { in: studentIds } },
          select: { id: true, firstName: true, lastName: true },
        });
        newStudents.sort((a, b) => {
          const fa = a.firstName.toLowerCase(), fb = b.firstName.toLowerCase();
          if (fa !== fb) return fa < fb ? -1 : 1;
          return a.lastName.toLowerCase() < b.lastName.toLowerCase() ? -1 : 1;
        });
        for (let i = 0; i < newStudents.length; i++) {
          const seq = String(maxSeq + i + 1).padStart(3, "0");
          await tx.studentProfile.update({
            where: { id: newStudents[i].id },
            data: {
              rollNumber: `${campusCode}-${programCode}-${gradeOrder}-${secName}-${seq}`.toUpperCase(),
            },
          });
        }
      }

      // ── Step E: ImportHistory ────────────────────────────────────────────
      const history = await tx.importHistory.create({
        data: {
          sectionId: section.id,
          importedById: userId,
          studentsCreated: studentIds.length,
          parentsCreated,
          parentsLinked,
          siblingsLinked,
          totalRows: validRawRows.length,
          studentIds,
        },
      });

      // ── Step F: ImportCredentials ────────────────────────────────────────
      for (const cred of credentialsToCreate) {
        await tx.importCredential.create({
          data: {
            importId: history.id,
            userId: cred.userId,
            plainTextPassword: cred.plainTextPassword,
          },
        });
      }

      return {
        importId: history.id,
        sectionId: section.id,
        studentsCreated: studentIds.length,
        parentsCreated,
        parentsLinked,
        siblingsLinked,
        importedAt: history.importedAt.toISOString(),
      } satisfies ImportResult;
    },
    { timeout: 120000 }
  );

  validationCache.delete(validationToken);

  // ── Fire-and-forget WhatsApp credential messages ──────────────────────────
  // Run after the transaction so a WhatsApp failure never blocks the import.
  sendImportCredentialMessages(result.importId, section).catch((err) => {
    logger.warn('[Import] WhatsApp credential dispatch failed', { importId: result.importId, err });
  });

  return result;
};

// Fetches imported student + parent data and sends one WhatsApp per student
async function sendImportCredentialMessages(
  importId: string,
  section: {
    name: string;
    grade: { displayOrder: number; name: string; program: { name: string; code: string; campus: { name: string } } };
  }
): Promise<void> {
  const appUrl = process.env.APP_URL ?? 'https://your-school-portal.com';

  const credentials = await prisma.importCredential.findMany({
    where: { importId },
    include: {
      user: {
        include: {
          studentProfile: {
            select: {
              id: true, firstName: true, lastName: true,
              rollNumber: true, fatherName: true, guardianPhone: true, fatherCnic: true,
            },
          },
          parentProfile: {
            select: { id: true, cnic: true },
          },
        },
      },
    },
  });

  // Build maps: studentId → student password, parentCnic → parent password
  const studentPassMap = new Map<string, { password: string; phone: string | null; rollNumber: string | null; firstName: string; lastName: string; fatherName: string | null; fatherCnic: string | null }>();
  const parentPassMap = new Map<string, string>(); // cnic → plainTextPassword

  for (const cred of credentials) {
    if (cred.user.studentProfile) {
      const sp = cred.user.studentProfile;
      studentPassMap.set(sp.id, {
        password: cred.plainTextPassword,
        phone: sp.guardianPhone,
        rollNumber: sp.rollNumber,
        firstName: sp.firstName,
        lastName: sp.lastName,
        fatherName: sp.fatherName,
        fatherCnic: sp.fatherCnic,
      });
    } else if (cred.user.parentProfile) {
      const pp = cred.user.parentProfile;
      if (pp.cnic) parentPassMap.set(pp.cnic, cred.plainTextPassword);
    }
  }

  const sectionLabel = `${section.grade.program.name} ${section.grade.name} — Section ${section.name}`;
  const campusName = section.grade.program.campus.name;

  for (const [, student] of studentPassMap) {
    if (!student.phone) continue; // no guardian phone — cannot send

    const parentPassword = student.fatherCnic
      ? (parentPassMap.get(student.fatherCnic) ?? 'See credentials file')
      : 'See credentials file';

    await sendCredentialsWhatsApp(student.phone, {
      parentName: student.fatherName ?? 'Guardian',
      studentName: `${student.firstName} ${student.lastName}`,
      campusName,
      sectionLabel,
      rollNumber: student.rollNumber ?? '—',
      studentPassword: student.password,
      parentCnic: student.fatherCnic ?? '—',
      parentPassword,
      appUrl,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// generateCredentialFile
// ─────────────────────────────────────────────────────────────────────────────
export const generateCredentialFile = async (
  importId: string,
  requestingUserId: string,
  userRole: Role
): Promise<{ buffer: Buffer; filename: string }> => {
  const history = await prisma.importHistory.findUnique({
    where: { id: importId },
    include: {
      section: {
        include: { grade: { include: { program: { include: { campus: true } } } } },
      },
    },
  });
  if (!history) throw Object.assign(new Error("Import record not found"), { statusCode: 404 });

  if (userRole !== Role.SUPER_ADMIN && history.importedById !== requestingUserId) {
    throw Object.assign(
      new Error("You are not authorised to download this credential file"),
      { statusCode: 403 }
    );
  }

  const credentials = await prisma.importCredential.findMany({
    where: { importId },
    include: {
      user: {
        include: {
          studentProfile: {
            select: { firstName: true, lastName: true, rollNumber: true, fatherName: true },
          },
          parentProfile: {
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
  });

  const sectionLabel = `${history.section.grade.program.campus.name} / ${history.section.grade.program.code} / Grade ${history.section.grade.displayOrder} / ${history.section.name}`;

  type SRow = { rollNumber: string; studentName: string; email: string; tempPassword: string; fatherName: string; section: string };
  type PRow = { fatherName: string; email: string; tempPassword: string; children: string; note: string };

  const studentRows: SRow[] = [];
  const parentRows: PRow[] = [];

  for (const cred of credentials) {
    if (cred.user.studentProfile) {
      const sp = cred.user.studentProfile;
      studentRows.push({
        rollNumber: sp.rollNumber ?? "",
        studentName: `${sp.firstName} ${sp.lastName}`,
        email: cred.user.email,
        tempPassword: cred.plainTextPassword,
        fatherName: sp.fatherName ?? "",
        section: sectionLabel,
      });
    } else if (cred.user.parentProfile) {
      const pp = cred.user.parentProfile;
      parentRows.push({
        fatherName: `${pp.firstName} ${pp.lastName}`,
        email: cred.user.email,
        tempPassword: cred.plainTextPassword,
        children: studentRows
          .filter((s) => s.fatherName.toLowerCase() === `${pp.firstName} ${pp.lastName}`.toLowerCase())
          .map((s) => s.rollNumber)
          .join(", "),
        note: "New account",
      });
    }
  }

  const workbook = new ExcelJS.Workbook();

  const sheet1 = workbook.addWorksheet("Student Credentials");
  sheet1.columns = [
    { header: "Roll Number", key: "rollNumber", width: 22 },
    { header: "Student Name", key: "studentName", width: 28 },
    { header: "Email", key: "email", width: 38 },
    { header: "Temporary Password", key: "tempPassword", width: 22 },
    { header: "Father Name", key: "fatherName", width: 28 },
    { header: "Section", key: "section", width: 45 },
  ];
  sheet1.getRow(1).font = { bold: true };
  for (const row of studentRows) sheet1.addRow(row);

  const sheet2 = workbook.addWorksheet("Parent Credentials");
  sheet2.columns = [
    { header: "Father Name", key: "fatherName", width: 28 },
    { header: "Email", key: "email", width: 38 },
    { header: "Temporary Password", key: "tempPassword", width: 22 },
    { header: "Children Roll Numbers", key: "children", width: 40 },
    { header: "Note", key: "note", width: 30 },
  ];
  sheet2.getRow(1).font = { bold: true };
  for (const row of parentRows) sheet2.addRow(row);

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

  await prisma.importCredential.updateMany({
    where: { importId },
    data: { downloadedAt: new Date() },
  });

  const date = new Date().toISOString().slice(0, 10);
  const filename = `Credentials_${history.section.name}_${date}.xlsx`;

  return { buffer, filename };
};

// ─────────────────────────────────────────────────────────────────────────────
// getImportHistory
// ─────────────────────────────────────────────────────────────────────────────
export const getImportHistory = async (sectionId: string): Promise<ImportHistoryRecord[]> => {
  const records = await prisma.importHistory.findMany({
    where: { sectionId },
    orderBy: { importedAt: "desc" },
    include: {
      importedBy: {
        include: {
          staffProfile: { select: { firstName: true, lastName: true } },
        },
      },
      credentials: { select: { downloadedAt: true } },
    },
  });

  return records.map((r) => ({
    id: r.id,
    importedAt: r.importedAt,
    studentsCreated: r.studentsCreated,
    parentsCreated: r.parentsCreated,
    parentsLinked: r.parentsLinked,
    siblingsLinked: r.siblingsLinked,
    totalRows: r.totalRows,
    credentialsDownloaded:
      r.credentials.length > 0 && r.credentials.every((c) => c.downloadedAt !== null),
    importedBy: {
      firstName: r.importedBy.staffProfile?.firstName ?? "Admin",
      lastName: r.importedBy.staffProfile?.lastName ?? "",
    },
  }));
};
