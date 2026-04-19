import prisma from '../../../config/database'
import { DayOfWeek } from '@prisma/client'

const JS_DAY_TO_ENUM: Record<number, DayOfWeek> = {
  1: DayOfWeek.MON,
  2: DayOfWeek.TUE,
  3: DayOfWeek.WED,
  4: DayOfWeek.THU,
  5: DayOfWeek.FRI,
  6: DayOfWeek.SAT,
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

export async function getStudentDashboardData(userId: string) {
  // 1. Resolve StudentProfile
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
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
      campus: {
        select: { name: true },
      },
    },
  })

  if (!studentProfile) {
    return {
      student: null,
      todayTimetable: [],
      attendanceSummary: { presentDays: 0, absentDays: 0, totalDays: 0, attendancePct: 0, bySubject: [] },
      recentResults: [],
      announcements: [],
    }
  }

  const todayDow = JS_DAY_TO_ENUM[new Date().getDay()] ?? null
  const currentYear = new Date().getFullYear()
  const academicYear = `${currentYear}-${currentYear + 1}`

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const [todaySlots, attendanceRecords, recentResults, announcements] = await Promise.all([
    // 2. Today's timetable
    todayDow && studentProfile.sectionId
      ? prisma.timetableSlot.findMany({
          where: {
            sectionId: studentProfile.sectionId,
            dayOfWeek: todayDow,
            academicYear,
          },
          orderBy: { slotNumber: 'asc' },
          select: {
            id: true,
            slotNumber: true,
            startTime: true,
            endTime: true,
            slotType: true,
            subject: { select: { name: true } },
            staff: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        })
      : Promise.resolve([]),

    // 3. Attendance last 30 days
    prisma.studentAttendance.findMany({
      where: {
        studentId: studentProfile.id,
        date: { gte: thirtyDaysAgo },
      },
      select: {
        date: true,
        status: true,
        subject: { select: { name: true } },
      },
      orderBy: { date: 'asc' },
    }),

    // 4. Recent exam results (last 5)
    prisma.examResult.findMany({
      where: {
        studentId: studentProfile.id,
        obtainedMarks: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        obtainedMarks: true,
        isAbsent: true,
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

    // 5. Announcements for students
    prisma.announcement.findMany({
      where: {
        audience: { in: ['ALL', 'STUDENTS'] },
        campusId: studentProfile.campusId,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
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

  // Compute overall attendance (per-day dedup)
  const dayMap = new Map<string, string>()
  for (const r of attendanceRecords) {
    const key = r.date.toISOString().split('T')[0]
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

  // Per-subject attendance breakdown
  const subjectMap = new Map<string, { present: number; total: number }>()
  for (const r of attendanceRecords) {
    const subj = r.subject?.name ?? 'Unknown'
    if (!subjectMap.has(subj)) subjectMap.set(subj, { present: 0, total: 0 })
    const entry = subjectMap.get(subj)!
    entry.total++
    if (r.status === 'PRESENT' || r.status === 'LATE') entry.present++
  }
  const bySubject = Array.from(subjectMap.entries()).map(([subjectName, counts]) => ({
    subjectName,
    presentDays: counts.present,
    totalDays: counts.total,
    pct: counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : 0,
  }))

  return {
    student: {
      id: studentProfile.id,
      firstName: studentProfile.firstName,
      lastName: studentProfile.lastName,
      rollNumber: studentProfile.rollNumber ?? null,
      sectionId: studentProfile.sectionId ?? null,
      sectionName: studentProfile.section?.name ?? null,
      gradeName: studentProfile.section?.grade.name ?? null,
      programName: studentProfile.section?.grade.program.name ?? null,
      campusName: studentProfile.campus?.name ?? null,
    },
    todayTimetable: todaySlots.map((s) => ({
      id: s.id,
      slotNumber: s.slotNumber,
      startTime: s.startTime,
      endTime: s.endTime,
      slotType: s.slotType,
      subjectName: s.subject?.name ?? null,
      teacherName: s.staff ? `${s.staff.firstName} ${s.staff.lastName}` : null,
    })),
    attendanceSummary: { presentDays, absentDays, totalDays, attendancePct, bySubject },
    recentResults: recentResults.map((r) => ({
      id: r.id,
      subjectName: r.exam.subject.name,
      examTypeName: r.exam.examType.name,
      date: r.exam.date.toISOString().split('T')[0],
      obtainedMarks: r.obtainedMarks ?? 0,
      totalMarks: r.exam.totalMarks,
      grade: computeGrade(r.obtainedMarks ?? 0, r.exam.totalMarks),
      isAbsent: r.isAbsent,
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
