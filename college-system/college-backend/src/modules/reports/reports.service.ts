import ExcelJS from 'exceljs'
import prisma from '../../config/database'
import {
  AttendanceReportFilters,
  FeeReportFilters,
  ResultsReportFilters,
  ReportFormat,
  ReportResult,
} from './reports.types'

// ─── Academic Years ───────────────────────────────────────────────────────────

export const getDistinctAcademicYears = async (campusId?: string): Promise<string[]> => {
  const where: any = {}
  if (campusId) where.campusId = campusId

  const structures = await prisma.feeStructure.findMany({
    where,
    select: { academicYear: true },
    distinct: ['academicYear'],
    orderBy: { academicYear: 'desc' },
  })

  return structures.map((s) => s.academicYear)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateGrade(obtained: number, total: number): { grade: string; percentage: number } {
  const percentage = (obtained / total) * 100
  let grade = 'F'
  if (percentage >= 90) grade = 'A+'
  else if (percentage >= 80) grade = 'A'
  else if (percentage >= 70) grade = 'B'
  else if (percentage >= 60) grade = 'C'
  else if (percentage >= 50) grade = 'D'
  return { grade, percentage: Math.round(percentage * 100) / 100 }
}

function htmlWrapper(title: string, tableHtml: string, subtitle?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 24px; }
  .header { text-align: center; margin-bottom: 20px; }
  .header h1 { font-size: 22px; font-weight: 700; color: #1e3a5f; }
  .header p  { font-size: 13px; color: #555; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th { background: #1e3a5f; color: #fff; font-size: 11px; text-transform: uppercase;
       letter-spacing: 0.05em; padding: 8px 10px; text-align: left; }
  td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
  tr:nth-child(even) td { background: #f3f4f6; }
  .summary { margin-top: 16px; font-size: 12px; color: #555; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<div class="header">
  <h1>College Management System</h1>
  <p>${title}${subtitle ? ' — ' + subtitle : ''}</p>
</div>
${tableHtml}
</body>
</html>`
}

function applyHeaderRow(row: ExcelJS.Row, cols: string[]): void {
  row.values = ['', ...cols]
  row.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } }
  row.alignment = { vertical: 'middle', horizontal: 'left' }
  row.height = 22
}

function applyDataRow(row: ExcelJS.Row, even: boolean): void {
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: even ? 'FFFFFFFF' : 'FFF3F4F6' },
  }
  row.alignment = { vertical: 'middle' }
}

// ─── Attendance Report ────────────────────────────────────────────────────────

export const generateAttendanceReport = async (
  filters: AttendanceReportFilters,
  format: ReportFormat
): Promise<ReportResult> => {
  const start = new Date(filters.startDate + 'T00:00:00.000Z')
  const end   = new Date(filters.endDate   + 'T23:59:59.999Z')

  const where: any = {
    date: { gte: start, lte: end },
    // Filter by campus through the section → grade → program → campus chain
    // (more reliable than student.campusId when campus IDs may be inconsistent)
    section: { grade: { program: { campusId: filters.campusId } } },
  }
  if (filters.sectionId) where.sectionId = filters.sectionId
  if (filters.studentId) where.studentId = filters.studentId

  const records = await prisma.studentAttendance.findMany({
    where,
    include: {
      student: { select: { id: true, firstName: true, lastName: true, rollNumber: true } },
      subject: { select: { id: true, name: true } },
    },
    orderBy: [{ student: { rollNumber: 'asc' } }, { date: 'asc' }],
  })

  // Group by student
  const studentMap = new Map<string, {
    firstName: string
    lastName: string
    rollNumber: string | null
    total: number
    present: number
    absent: number
    late: number
    leave: number
  }>()

  for (const r of records) {
    const id = r.studentId
    if (!studentMap.has(id)) {
      studentMap.set(id, {
        firstName: r.student.firstName,
        lastName: r.student.lastName,
        rollNumber: r.student.rollNumber ?? null,
        total: 0, present: 0, absent: 0, late: 0, leave: 0,
      })
    }
    const s = studentMap.get(id)!
    s.total++
    if (r.status === 'PRESENT') s.present++
    else if (r.status === 'ABSENT') s.absent++
    else if (r.status === 'LATE') s.late++
    else if (r.status === 'LEAVE') s.leave++
  }

  const rows = Array.from(studentMap.values()).map((s) => ({
    rollNumber: s.rollNumber ?? '—',
    name: `${s.firstName} ${s.lastName}`,
    total: s.total,
    present: s.present,
    absent: s.absent,
    late: s.late,
    percentage: s.total > 0
      ? Math.round(((s.present + s.late) / s.total) * 100 * 100) / 100
      : 0,
  }))

  const filename = `attendance_report_${filters.startDate}_${filters.endDate}`

  // ── JSON ──
  if (format === 'json') {
    return { data: rows, filename }
  }

  // ── HTML ──
  if (format === 'html') {
    const thead = `<tr><th>#</th><th>Roll No</th><th>Student Name</th><th>Total Days</th><th>Present</th><th>Absent</th><th>Late</th><th>Attendance %</th></tr>`
    const tbody = rows
      .map(
        (r, i) =>
          `<tr><td>${i + 1}</td><td>${r.rollNumber}</td><td>${r.name}</td><td>${r.total}</td><td>${r.present}</td><td>${r.absent}</td><td>${r.late}</td><td>${r.percentage}%</td></tr>`
      )
      .join('')
    const html = htmlWrapper(
      'Attendance Report',
      `<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>`,
      `${filters.startDate} to ${filters.endDate}`
    )
    return { html, filename: filename + '.html' }
  }

  // ── Excel ──
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'College Management System'
  const sheet = workbook.addWorksheet('Attendance Report')

  const headers = ['Roll No', 'Student Name', 'Total Days', 'Present', 'Absent', 'Late', 'Percentage']
  sheet.columns = [
    { key: 'idx',        width: 6  },
    { key: 'rollNumber', width: 14 },
    { key: 'name',       width: 28 },
    { key: 'total',      width: 14 },
    { key: 'present',    width: 12 },
    { key: 'absent',     width: 12 },
    { key: 'late',       width: 10 },
    { key: 'percentage', width: 16 },
  ]

  applyHeaderRow(sheet.addRow([]), headers)

  rows.forEach((r, i) => {
    const row = sheet.addRow([i + 1, r.rollNumber, r.name, r.total, r.present, r.absent, r.late, `${r.percentage}%`])
    applyDataRow(row, i % 2 === 0)
  })

  const buffer = await workbook.xlsx.writeBuffer() as unknown as Buffer
  return { buffer, filename: filename + '.xlsx' }
}

// ─── Fee Report ───────────────────────────────────────────────────────────────

export const generateFeeReport = async (
  filters: FeeReportFilters,
  format: ReportFormat
): Promise<ReportResult> => {
  const where: any = {
    academicYear: filters.academicYear,
    // Filter by campus through the fee structure (more direct than student.campusId)
    feeStructure: { campusId: filters.campusId },
  }
  if (filters.status) where.status = filters.status

  const records = await prisma.feeRecord.findMany({
    where,
    include: {
      student: { select: { id: true, firstName: true, lastName: true, rollNumber: true } },
      feeStructure: {
        select: {
          totalFee: true,
          academicYear: true,
          program: { select: { name: true } },
          grade:   { select: { name: true } },
        },
      },
    },
    orderBy: [{ student: { rollNumber: 'asc' } }],
  })

  const rows = records.map((r) => ({
    rollNumber:  r.student.rollNumber ?? '—',
    name:        `${r.student.firstName} ${r.student.lastName}`,
    program:     r.feeStructure.program.name,
    grade:       r.feeStructure.grade.name,
    amountDue:   r.amountDue,
    amountPaid:  r.amountPaid,
    discount:    r.discount,
    balance:     r.amountDue - r.amountPaid - r.discount,
    status:      r.status,
    receiptNo:   r.receiptNumber ?? '—',
  }))

  // Summary totals
  const totalDue  = rows.reduce((s, r) => s + r.amountDue,  0)
  const totalPaid = rows.reduce((s, r) => s + r.amountPaid, 0)
  const totalDisc = rows.reduce((s, r) => s + r.discount,   0)
  const totalBal  = rows.reduce((s, r) => s + r.balance,    0)

  const filename = `fee_report_${filters.academicYear}`

  // ── JSON ──
  if (format === 'json') {
    return { data: { rows, totals: { totalDue, totalPaid, totalDisc, totalBal } }, filename }
  }

  // ── HTML ──
  if (format === 'html') {
    const thead = `<tr><th>#</th><th>Roll No</th><th>Student Name</th><th>Program</th><th>Grade</th><th>Amount Due</th><th>Amount Paid</th><th>Discount</th><th>Balance</th><th>Status</th><th>Receipt No</th></tr>`
    const statusColor = (s: string) =>
      s === 'PAID' ? 'color:#059669;font-weight:600' :
      s === 'OVERDUE' ? 'color:#DC2626;font-weight:600' :
      s === 'PARTIAL' ? 'color:#7C3AED;font-weight:600' : ''
    const tbody = rows
      .map(
        (r, i) =>
          `<tr><td>${i + 1}</td><td>${r.rollNumber}</td><td>${r.name}</td><td>${r.program}</td><td>${r.grade}</td><td>${r.amountDue}</td><td>${r.amountPaid}</td><td>${r.discount}</td><td>${r.balance}</td><td style="${statusColor(r.status)}">${r.status}</td><td>${r.receiptNo}</td></tr>`
      )
      .join('')
    const summaryRow = `<tr style="font-weight:700;background:#e5e7eb"><td colspan="5">TOTALS</td><td>${totalDue}</td><td>${totalPaid}</td><td>${totalDisc}</td><td>${totalBal}</td><td colspan="2"></td></tr>`
    const html = htmlWrapper(
      'Fee Report',
      `<table><thead>${thead}</thead><tbody>${tbody}${summaryRow}</tbody></table>`,
      `Academic Year: ${filters.academicYear}`
    )
    return { html, filename: filename + '.html' }
  }

  // ── Excel ──
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Fee Report')

  const headers = ['Roll No', 'Student Name', 'Program', 'Grade', 'Amount Due', 'Amount Paid', 'Discount', 'Balance', 'Status', 'Receipt No']
  sheet.columns = [
    { key: 'idx',       width: 6  },
    { key: 'roll',      width: 14 },
    { key: 'name',      width: 28 },
    { key: 'program',   width: 20 },
    { key: 'grade',     width: 14 },
    { key: 'amtDue',    width: 14 },
    { key: 'amtPaid',   width: 14 },
    { key: 'discount',  width: 12 },
    { key: 'balance',   width: 14 },
    { key: 'status',    width: 12 },
    { key: 'receipt',   width: 16 },
  ]

  applyHeaderRow(sheet.addRow([]), headers)

  rows.forEach((r, i) => {
    const row = sheet.addRow([
      i + 1, r.rollNumber, r.name, r.program, r.grade,
      r.amountDue, r.amountPaid, r.discount, r.balance, r.status, r.receiptNo,
    ])
    applyDataRow(row, i % 2 === 0)

    // Color code status cell (column 10 = index 10, 1-based in ExcelJS)
    const statusCell = row.getCell(10)
    if (r.status === 'PAID')    statusCell.font = { color: { argb: 'FF059669' }, bold: true }
    if (r.status === 'OVERDUE') statusCell.font = { color: { argb: 'FFDC2626' }, bold: true }
    if (r.status === 'PARTIAL') statusCell.font = { color: { argb: 'FF7C3AED' }, bold: true }
  })

  // Summary row
  const sumRow = sheet.addRow([
    '', 'TOTALS', '', '', '', totalDue, totalPaid, totalDisc, totalBal, '', '',
  ])
  sumRow.font = { bold: true }
  sumRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } }

  const buffer = await workbook.xlsx.writeBuffer() as unknown as Buffer
  return { buffer, filename: filename + '.xlsx' }
}

// ─── Results Report ───────────────────────────────────────────────────────────

export const generateResultsReport = async (
  filters: ResultsReportFilters,
  format: ReportFormat
): Promise<ReportResult> => {
  const examWhere: any = { sectionId: filters.sectionId }
  if (filters.examId)   examWhere.id = filters.examId
  if (filters.subjectId) examWhere.subjectId = filters.subjectId

  const exams = await prisma.exam.findMany({
    where: examWhere,
    include: {
      examType: { select: { name: true } },
      subject:  { select: { name: true } },
      results: {
        include: {
          student: { select: { id: true, firstName: true, lastName: true, rollNumber: true } },
        },
      },
    },
    orderBy: { date: 'asc' },
  })

  const rows: {
    rollNumber: string
    name: string
    subject: string
    examType: string
    date: string
    totalMarks: number
    obtainedMarks: number | null
    grade: string
    percentage: number | null
    isAbsent: boolean
  }[] = []

  for (const exam of exams) {
    const dateStr = exam.date instanceof Date
      ? exam.date.toISOString().split('T')[0]
      : String(exam.date)

    for (const r of exam.results) {
      let grade = '—'
      let percentage: number | null = null

      if (!r.isAbsent && r.obtainedMarks !== null && r.obtainedMarks !== undefined) {
        const calc = calculateGrade(r.obtainedMarks, exam.totalMarks)
        grade = calc.grade
        percentage = calc.percentage
      }

      rows.push({
        rollNumber:   r.student.rollNumber ?? '—',
        name:         `${r.student.firstName} ${r.student.lastName}`,
        subject:      exam.subject.name,
        examType:     exam.examType.name,
        date:         dateStr,
        totalMarks:   exam.totalMarks,
        obtainedMarks: r.isAbsent ? null : (r.obtainedMarks ?? null),
        grade,
        percentage,
        isAbsent: r.isAbsent,
      })
    }
  }

  // Sort: roll number → subject → date
  rows.sort((a, b) => {
    const rn = a.rollNumber.localeCompare(b.rollNumber)
    if (rn !== 0) return rn
    const sn = a.subject.localeCompare(b.subject)
    if (sn !== 0) return sn
    return a.date.localeCompare(b.date)
  })

  const filename = `results_report_${filters.sectionId}`

  // ── JSON ──
  if (format === 'json') {
    return { data: rows, filename }
  }

  // ── HTML ──
  if (format === 'html') {
    const thead = `<tr><th>#</th><th>Roll No</th><th>Student Name</th><th>Subject</th><th>Exam Type</th><th>Date</th><th>Total</th><th>Obtained</th><th>Grade</th><th>Percentage</th></tr>`
    const gradeColor = (g: string) =>
      g === 'A+' || g === 'A' ? 'color:#059669;font-weight:600' :
      g === 'B'  || g === 'C' ? 'color:#2563EB;font-weight:600' :
      g === 'D'                ? 'color:#D97706;font-weight:600' :
      g === 'F'                ? 'color:#DC2626;font-weight:600' : ''
    const tbody = rows
      .map(
        (r, i) =>
          `<tr><td>${i + 1}</td><td>${r.rollNumber}</td><td>${r.name}</td><td>${r.subject}</td><td>${r.examType}</td><td>${r.date}</td><td>${r.totalMarks}</td><td>${r.isAbsent ? 'Absent' : (r.obtainedMarks ?? '—')}</td><td style="${gradeColor(r.grade)}">${r.grade}</td><td>${r.isAbsent ? '—' : (r.percentage !== null ? r.percentage + '%' : '—')}</td></tr>`
      )
      .join('')
    const html = htmlWrapper(
      'Results Report',
      `<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>`
    )
    return { html, filename: filename + '.html' }
  }

  // ── Excel ──
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Results Report')

  const headers = ['Roll No', 'Student Name', 'Subject', 'Exam Type', 'Date', 'Total', 'Obtained', 'Grade', 'Percentage']
  sheet.columns = [
    { key: 'idx',        width: 6  },
    { key: 'roll',       width: 14 },
    { key: 'name',       width: 28 },
    { key: 'subject',    width: 22 },
    { key: 'examType',   width: 18 },
    { key: 'date',       width: 14 },
    { key: 'total',      width: 10 },
    { key: 'obtained',   width: 12 },
    { key: 'grade',      width: 10 },
    { key: 'percentage', width: 14 },
  ]

  applyHeaderRow(sheet.addRow([]), headers)

  rows.forEach((r, i) => {
    const row = sheet.addRow([
      i + 1,
      r.rollNumber,
      r.name,
      r.subject,
      r.examType,
      r.date,
      r.totalMarks,
      r.isAbsent ? 'Absent' : (r.obtainedMarks ?? '—'),
      r.grade,
      r.isAbsent ? '—' : (r.percentage !== null ? `${r.percentage}%` : '—'),
    ])
    applyDataRow(row, i % 2 === 0)

    // Color-code grade cell (column 9)
    const gradeCell = row.getCell(9)
    if (r.grade === 'A+' || r.grade === 'A') gradeCell.font = { color: { argb: 'FF059669' }, bold: true }
    else if (r.grade === 'B' || r.grade === 'C') gradeCell.font = { color: { argb: 'FF2563EB' }, bold: true }
    else if (r.grade === 'D') gradeCell.font = { color: { argb: 'FFD97706' }, bold: true }
    else if (r.grade === 'F') gradeCell.font = { color: { argb: 'FFDC2626' }, bold: true }
  })

  const buffer = await workbook.xlsx.writeBuffer() as unknown as Buffer
  return { buffer, filename: filename + '.xlsx' }
}
