import prisma from '../../../config/database'
import { StaffAttendanceStatus, FeeStatus, ExamStatus } from '@prisma/client'

// ─── Per-campus breakdown helper ──────────────────────────────────────────────

async function getCampusSnapshot(campusId: string, campusName: string) {
  const { start: todayStart, end: todayEnd } = getTodayRange()

  const [totalStudents, totalStaff, totalSections, todayStaffAttendance, absentStaffCount] =
    await Promise.all([
      prisma.studentProfile.count({
        where: { status: 'ACTIVE', section: { grade: { program: { campusId } } } },
      }),
      prisma.staffCampusAssignment.count({ where: { campusId, removedAt: null } }),
      prisma.section.count({ where: { grade: { program: { campusId } } } }),
      prisma.staffAttendance.groupBy({
        by: ['status'],
        where: { campusId, date: { gte: todayStart, lt: todayEnd } },
        _count: { status: true },
      }),
      prisma.staffAttendance.count({
        where: {
          campusId,
          date: { gte: todayStart, lt: todayEnd },
          status: StaffAttendanceStatus.ABSENT,
        },
      }),
    ])

  const attendanceMap: Record<string, number> = {}
  for (const row of todayStaffAttendance) attendanceMap[row.status] = row._count.status
  const presentStaff = attendanceMap[StaffAttendanceStatus.PRESENT] ?? 0

  const todayFeeCollection = await prisma.feeRecord.aggregate({
    _sum: { amountPaid: true },
    where: { paidAt: { gte: todayStart, lt: todayEnd }, feeStructure: { campusId } },
  })

  return {
    campusId,
    campusName,
    totalStudents,
    totalStaff,
    totalSections,
    presentStaff,
    absentStaffCount,
    todayFeeCollection: todayFeeCollection._sum.amountPaid ?? 0,
  }
}

function getTodayRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return { start, end }
}

function getMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return { start, end }
}

export async function getPrincipalDashboardData(campusId?: string) {
  // Build per-campus breakdown when no specific campus is selected
  let campusBreakdown: Awaited<ReturnType<typeof getCampusSnapshot>>[] = []
  if (!campusId) {
    const allCampuses = await prisma.campus.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
    campusBreakdown = await Promise.all(
      allCampuses.map((c) => getCampusSnapshot(c.id, c.name))
    )
  }

  const { start: todayStart, end: todayEnd } = getTodayRange()
  const { start: monthStart, end: monthEnd } = getMonthRange()

  // campus filter for staff
  const campusFilter = campusId ? { campusId } : {}

  // section → grade → program → campus filter
  const sectionCampusFilter = campusId
    ? { grade: { program: { campusId } } }
    : {}

  const [
    totalStudents,
    totalStaff,
    totalSections,
    todayStaffAttendance,
    totalStaffForCampus,
    todayFeeCollection,
    totalPendingFees,
    monthFeeCollection,
    defaulterCount,
    recentAnnouncements,
    upcomingExams,
  ] = await Promise.all([
    // 1. Total active students
    prisma.studentProfile.count({
      where: {
        status: 'ACTIVE',
        ...(campusId
          ? { section: { grade: { program: { campusId } } } }
          : {}),
      },
    }),

    // 2. Total staff (campus-assigned)
    campusId
      ? prisma.staffCampusAssignment.count({
          where: { campusId, removedAt: null },
        })
      : prisma.staffProfile.count(),

    // 3. Total sections
    prisma.section.count({ where: sectionCampusFilter }),

    // 4. Today's staff attendance records
    prisma.staffAttendance.groupBy({
      by: ['status'],
      where: {
        ...campusFilter,
        date: { gte: todayStart, lt: todayEnd },
      },
      _count: { status: true },
    }),

    // 5. Total staff for campus (to compute attendance %)
    campusId
      ? prisma.staffCampusAssignment.count({
          where: { campusId, removedAt: null },
        })
      : prisma.staffProfile.count(),

    // 6. Today's fee collection
    prisma.feeRecord.aggregate({
      _sum: { amountPaid: true },
      where: {
        paidAt: { gte: todayStart, lt: todayEnd },
        ...(campusId
          ? { feeStructure: { campusId } }
          : {}),
      },
    }),

    // 7. Total pending fees
    prisma.feeRecord.aggregate({
      _sum: { amountDue: true, amountPaid: true },
      where: {
        status: { not: FeeStatus.PAID },
        ...(campusId ? { feeStructure: { campusId } } : {}),
      },
    }),

    // 8. This month's fee collection
    prisma.feeRecord.aggregate({
      _sum: { amountPaid: true },
      where: {
        paidAt: { gte: monthStart, lt: monthEnd },
        ...(campusId ? { feeStructure: { campusId } } : {}),
      },
    }),

    // 9. Fee defaulters count
    prisma.feeRecord.count({
      where: {
        status: FeeStatus.OVERDUE,
        ...(campusId ? { feeStructure: { campusId } } : {}),
      },
    }),

    // 10. Recent announcements (last 5)
    prisma.announcement.findMany({
      where: {
        OR: [
          { campusId: campusId ?? undefined },
          { audience: 'ALL' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        audience: true,
        publishedAt: true,
        createdAt: true,
      },
    }),

    // 11. Upcoming exams (next 5 scheduled)
    prisma.exam.findMany({
      where: {
        status: ExamStatus.SCHEDULED,
        date: { gte: todayStart },
        ...(campusId ? { section: { grade: { program: { campusId } } } } : {}),
      },
      orderBy: { date: 'asc' },
      take: 5,
      select: {
        id: true,
        date: true,
        startTime: true,
        section: { select: { name: true } },
        subject: { select: { name: true } },
        examType: { select: { name: true } },
      },
    }),
  ])

  // Build attendance summary from groupBy result
  const attendanceMap: Record<string, number> = {}
  for (const row of todayStaffAttendance) {
    attendanceMap[row.status] = row._count.status
  }

  const presentCount = attendanceMap[StaffAttendanceStatus.PRESENT] ?? 0
  const absentCount = attendanceMap[StaffAttendanceStatus.ABSENT] ?? 0
  const onLeaveCount = attendanceMap[StaffAttendanceStatus.ON_LEAVE] ?? 0
  const halfDayCount = attendanceMap[StaffAttendanceStatus.HALF_DAY] ?? 0

  // Fetch absent staff details
  const absentStaffRecords = await prisma.staffAttendance.findMany({
    where: {
      ...campusFilter,
      date: { gte: todayStart, lt: todayEnd },
      status: StaffAttendanceStatus.ABSENT,
    },
    select: {
      staff: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          staffCode: true,
          designation: true,
        },
      },
    },
  })

  const totalPendingAmount =
    (totalPendingFees._sum.amountDue ?? 0) - (totalPendingFees._sum.amountPaid ?? 0)

  return {
    stats: {
      totalStudents,
      totalStaff,
      totalSections,
      presentStaff: presentCount,
      totalStaffForCampus,
      todayFeeCollection: todayFeeCollection._sum.amountPaid ?? 0,
    },
    staffAttendanceSummary: {
      present: presentCount,
      absent: absentCount,
      onLeave: onLeaveCount,
      halfDay: halfDayCount,
    },
    absentStaff: absentStaffRecords.map((r) => ({
      id: r.staff.id,
      firstName: r.staff.firstName,
      lastName: r.staff.lastName,
      staffCode: r.staff.staffCode,
      designation: r.staff.designation ?? null,
    })),
    feeSummary: {
      totalPending: totalPendingAmount,
      collectedThisMonth: monthFeeCollection._sum.amountPaid ?? 0,
      defaulterCount,
    },
    recentAnnouncements: recentAnnouncements.map((a) => ({
      id: a.id,
      title: a.title,
      audience: a.audience,
      publishedAt: a.publishedAt?.toISOString() ?? a.createdAt.toISOString(),
    })),
    upcomingExams: upcomingExams.map((e) => ({
      id: e.id,
      date: e.date.toISOString().split('T')[0],
      startTime: e.startTime,
      sectionName: e.section.name,
      subjectName: e.subject.name,
      examTypeName: e.examType.name,
    })),
    campusBreakdown,
  }
}
