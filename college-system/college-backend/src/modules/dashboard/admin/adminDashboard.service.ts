import prisma from '../../../config/database'
import { StaffAttendanceStatus, FeeStatus, ExamStatus } from '@prisma/client'
import { cacheGet, cacheSet, TTL } from '../../../utils/cache'

function getTodayRange() {
  const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' })
  const start = new Date(dateStr + 'T00:00:00.000Z')
  const end = new Date(dateStr + 'T23:59:59.999Z')
  return { start, end }
}

export async function getAdminDashboardData(campusId?: string) {
  const cacheKey = `dashboard:admin:${campusId ?? 'all'}`;
  const cached = cacheGet<ReturnType<typeof _getAdminDashboardData>>(cacheKey);
  if (cached) return cached;
  const result = await _getAdminDashboardData(campusId);
  cacheSet(cacheKey, result, TTL.DASHBOARD);
  return result;
}

async function _getAdminDashboardData(campusId?: string) {
  const { start: todayStart, end: todayEnd } = getTodayRange()

  const campusFilter = campusId ? { campusId } : {}
  const sectionCampusFilter = campusId ? { grade: { program: { campusId } } } : {}
  const feeCampusFilter = campusId ? { feeStructure: { campusId } } : {}

  const [
    totalStudents,
    totalStaff,
    pendingFeeCount,
    totalSections,
    todayAttendance,
    pendingFeeTotal,
    overdueCount,
    upcomingExams,
    recentPayments,
  ] = await Promise.all([
    // 1. Total active students for campus
    prisma.studentProfile.count({
      where: {
        status: 'ACTIVE',
        ...(campusId ? { section: sectionCampusFilter } : {}),
      },
    }),

    // 2. Total staff for campus
    campusId
      ? prisma.staffCampusAssignment.count({ where: { campusId, removedAt: null } })
      : prisma.staffProfile.count(),

    // 3. Pending fee records count
    prisma.feeRecord.count({
      where: {
        status: { in: [FeeStatus.PENDING, FeeStatus.PARTIAL] },
        ...feeCampusFilter,
      },
    }),

    // 4. Total sections
    prisma.section.count({ where: sectionCampusFilter }),

    // 5. Today's staff attendance groupBy status
    prisma.staffAttendance.groupBy({
      by: ['status'],
      where: {
        ...campusFilter,
        date: { gte: todayStart, lt: todayEnd },
      },
      _count: { status: true },
    }),

    // 6. Total pending fee amount
    prisma.feeRecord.aggregate({
      _sum: { amountDue: true, amountPaid: true },
      where: {
        status: { not: FeeStatus.PAID },
        ...feeCampusFilter,
      },
    }),

    // 7. Overdue fee count
    prisma.feeRecord.count({
      where: {
        status: FeeStatus.OVERDUE,
        ...feeCampusFilter,
      },
    }),

    // 8. Upcoming exams — next 3 scheduled
    prisma.exam.findMany({
      where: {
        status: ExamStatus.SCHEDULED,
        date: { gte: todayStart },
        ...(campusId ? { section: sectionCampusFilter } : {}),
      },
      orderBy: { date: 'asc' },
      take: 3,
      select: {
        id: true,
        date: true,
        startTime: true,
        status: true,
        section: { select: { name: true } },
        subject: { select: { name: true } },
        examType: { select: { name: true } },
      },
    }),

    // 9. Recent fee payments — last 5 paid
    prisma.feeRecord.findMany({
      where: {
        status: FeeStatus.PAID,
        paidAt: { not: null },
        ...feeCampusFilter,
      },
      orderBy: { paidAt: 'desc' },
      take: 5,
      select: {
        id: true,
        amountPaid: true,
        paidAt: true,
        receiptNumber: true,
        student: {
          select: {
            firstName: true,
            lastName: true,
            rollNumber: true,
          },
        },
      },
    }),
  ])

  // Build attendance map
  const attendanceMap: Record<string, number> = {}
  for (const row of todayAttendance) {
    attendanceMap[row.status] = row._count.status
  }

  const pendingAmount =
    (pendingFeeTotal._sum.amountDue ?? 0) - (pendingFeeTotal._sum.amountPaid ?? 0)

  return {
    stats: {
      totalStudents,
      totalStaff,
      pendingFeeCount,
      totalSections,
    },
    staffAttendance: {
      present: attendanceMap[StaffAttendanceStatus.PRESENT] ?? 0,
      absent: attendanceMap[StaffAttendanceStatus.ABSENT] ?? 0,
      onLeave: attendanceMap[StaffAttendanceStatus.ON_LEAVE] ?? 0,
      halfDay: attendanceMap[StaffAttendanceStatus.HALF_DAY] ?? 0,
    },
    feeStats: {
      pendingCount: pendingFeeCount,
      pendingAmount,
      overdueCount,
    },
    upcomingExams: upcomingExams.map((e) => ({
      id: e.id,
      date: e.date.toISOString().split('T')[0],
      startTime: e.startTime,
      status: e.status,
      sectionName: e.section.name,
      subjectName: e.subject.name,
      examTypeName: e.examType.name,
    })),
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      amountPaid: p.amountPaid,
      paidAt: p.paidAt!.toISOString(),
      receiptNumber: p.receiptNumber ?? null,
      studentName: `${p.student.firstName} ${p.student.lastName}`,
      rollNumber: p.student.rollNumber ?? null,
    })),
  }
}
