import prisma from '../../../config/database'
import { FeeStatus } from '@prisma/client'

function getDateRange(daysBack: number) {
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' })
  const start = new Date(new Date(todayStr + 'T00:00:00.000Z').getTime() - daysBack * 24 * 60 * 60 * 1000)
  return { start }
}

function computeGrade(obtained: number, total: number): string {
  const pct = total > 0 ? (obtained / total) * 100 : 0
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B'
  if (pct >= 60) return 'C'
  if (pct >= 50) return 'D'
  return 'F'
}

export async function getParentDashboardData(userId: string, studentId?: string) {
  // 1. Resolve parentProfile
  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!parentProfile) {
    return {
      linkedStudents: [],
      primaryStudent: null,
      attendanceSummary: null,
      feeStatus: [],
      recentResults: [],
      announcements: [],
    }
  }

  // 2. Fetch all linked students
  const links = await prisma.studentParentLink.findMany({
    where: { parentId: parentProfile.id },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    select: {
      isPrimary: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
          campusId: true,
          sectionId: true,
          section: {
            select: {
              name: true,
              grade: {
                select: {
                  name: true,
                  program: { select: { name: true } },
                },
              },
            },
          },
        },
      },
    },
  })

  const linkedStudents = links.map((l) => ({
    id: l.student.id,
    firstName: l.student.firstName,
    lastName: l.student.lastName,
    rollNumber: l.student.rollNumber ?? null,
    sectionName: l.student.section?.name ?? null,
    gradeName: l.student.section?.grade.name ?? null,
    programName: l.student.section?.grade.program.name ?? null,
    isPrimary: l.isPrimary,
    campusId: l.student.campusId,
    sectionId: l.student.sectionId ?? null,
  }))

  if (linkedStudents.length === 0) {
    return { linkedStudents: [], primaryStudent: null, attendanceSummary: null, feeStatus: [], recentResults: [], announcements: [] }
  }

  // Determine target student
  const targetStudent = studentId
    ? linkedStudents.find((s) => s.id === studentId) ?? linkedStudents[0]
    : linkedStudents[0]

  const { start: last30 } = getDateRange(30)
  const { start: last7 } = getDateRange(7)

  // 3. Parallel fetch for primary student
  const [attendanceRecords, last7Attendance, pendingFees, recentResults, announcements] =
    await Promise.all([
      // Attendance last 30 days — distinct dates
      prisma.studentAttendance.findMany({
        where: {
          studentId: targetStudent.id,
          date: { gte: last30 },
        },
        select: {
          date: true,
          status: true,
        },
        orderBy: { date: 'asc' },
      }),

      // Attendance last 7 days
      prisma.studentAttendance.findMany({
        where: {
          studentId: targetStudent.id,
          date: { gte: last7 },
        },
        select: {
          date: true,
          status: true,
        },
        orderBy: { date: 'asc' },
      }),

      // Pending / partial fees
      prisma.feeRecord.findMany({
        where: {
          studentId: targetStudent.id,
          status: { in: [FeeStatus.PENDING, FeeStatus.PARTIAL, FeeStatus.OVERDUE] },
        },
        orderBy: { dueDate: 'asc' },
        select: {
          id: true,
          academicYear: true,
          amountDue: true,
          amountPaid: true,
          status: true,
          dueDate: true,
        },
      }),

      // Last 3 exam results
      prisma.examResult.findMany({
        where: {
          studentId: targetStudent.id,
          isAbsent: false,
          obtainedMarks: { not: null },
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          obtainedMarks: true,
          isAbsent: true,
          remarks: true,
          exam: {
            select: {
              totalMarks: true,
              date: true,
              subject: { select: { name: true } },
              examType: { select: { name: true } },
            },
          },
        },
      }),

      // Recent announcements for campus/section + parent/all audience
      prisma.announcement.findMany({
        where: {
          OR: [
            { campusId: targetStudent.campusId, audience: { in: ['ALL', 'STUDENTS', 'PARENTS'] } },
            ...(targetStudent.sectionId
              ? [{ sectionId: targetStudent.sectionId }]
              : []),
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          content: true,
          audience: true,
          publishedAt: true,
          createdAt: true,
        },
      }),
    ])

  // Compute attendance summary (per-day, not per-record)
  const dayMap = new Map<string, string>()
  for (const r of attendanceRecords) {
    const key = r.date.toISOString().split('T')[0]
    // If any record that day is PRESENT, mark the day as present
    const existing = dayMap.get(key)
    if (!existing || r.status === 'PRESENT') {
      dayMap.set(key, r.status)
    }
  }

  const dayStatuses = Array.from(dayMap.values())
  const presentDays = dayStatuses.filter((s) => s === 'PRESENT').length
  const lateDays = dayStatuses.filter((s) => s === 'LATE').length
  const absentDays = dayStatuses.filter((s) => s === 'ABSENT').length
  const totalDays = dayStatuses.length
  const attendancePct = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0

  // 7-day strip — use PKT date for "today" so keys match stored attendance dates
  const todayPKTStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' })
  const todayPKT = new Date(todayPKTStr + 'T00:00:00.000Z')
  const sevenDayStrip: { date: string; status: string | null }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayPKT.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().split('T')[0]
    const status = dayMap.has(key) ? dayMap.get(key)! : null
    sevenDayStrip.push({ date: key, status })
  }

  return {
    linkedStudents,
    primaryStudent: {
      ...targetStudent,
      attendancePct,
    },
    attendanceSummary: {
      presentDays,
      absentDays,
      totalDays,
      attendancePct,
      sevenDayStrip,
    },
    feeStatus: pendingFees.map((f) => ({
      id: f.id,
      academicYear: f.academicYear,
      amountDue: f.amountDue,
      amountPaid: f.amountPaid,
      balance: f.amountDue - f.amountPaid,
      status: f.status,
      dueDate: f.dueDate.toISOString().split('T')[0],
    })),
    recentResults: recentResults.map((r) => ({
      id: r.id,
      subjectName: r.exam.subject.name,
      examTypeName: r.exam.examType.name,
      date: r.exam.date.toISOString().split('T')[0],
      obtainedMarks: r.obtainedMarks ?? 0,
      totalMarks: r.exam.totalMarks,
      grade: computeGrade(r.obtainedMarks ?? 0, r.exam.totalMarks),
      isAbsent: r.isAbsent,
      remarks: r.remarks ?? null,
    })),
    announcements: announcements.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      audience: a.audience,
      publishedAt: (a.publishedAt ?? a.createdAt).toISOString(),
    })),
  }
}
