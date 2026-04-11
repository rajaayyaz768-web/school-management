import prisma from '../../../config/database'
import { DayOfWeek, ExamStatus } from '@prisma/client'

const JS_DAY_TO_ENUM: Record<number, DayOfWeek> = {
  1: DayOfWeek.MON,
  2: DayOfWeek.TUE,
  3: DayOfWeek.WED,
  4: DayOfWeek.THU,
  5: DayOfWeek.FRI,
  6: DayOfWeek.SAT,
}

function getTodayStart() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export async function getTeacherDashboardData(userId: string) {
  // Resolve staffId from userId
  const staffProfile = await prisma.staffProfile.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!staffProfile) {
    return { todaySchedule: [], mySections: [], upcomingExams: [], recentAttendance: [] }
  }

  const staffId = staffProfile.id
  const todayStart = getTodayStart()
  const todayDow = JS_DAY_TO_ENUM[new Date().getDay()] ?? null

  const currentYear = new Date().getFullYear()
  const academicYear = `${currentYear}-${currentYear + 1}`

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [todaySlots, mySectionAssignments, upcomingExams, recentAttendance] =
    await Promise.all([
      // 1. Today's timetable slots
      todayDow
        ? prisma.timetableSlot.findMany({
            where: { staffId, dayOfWeek: todayDow, academicYear },
            orderBy: { slotNumber: 'asc' },
            select: {
              id: true,
              slotNumber: true,
              startTime: true,
              endTime: true,
              slotType: true,
              section: { select: { name: true } },
              subject: { select: { name: true } },
            },
          })
        : Promise.resolve([]),

      // 2. My assigned sections (distinct)
      prisma.sectionSubjectTeacher.findMany({
        where: { staffId, academicYear },
        distinct: ['sectionId'],
        select: {
          section: {
            select: {
              id: true,
              name: true,
              _count: { select: { students: true } },
              grade: {
                select: {
                  name: true,
                  program: { select: { name: true } },
                },
              },
            },
          },
        },
      }),

      // 3. Upcoming exams in my sections
      prisma.exam.findMany({
        where: {
          status: ExamStatus.SCHEDULED,
          date: { gte: todayStart },
          section: {
            sectionSubjectTeachers: { some: { staffId, academicYear } },
          },
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

      // 4. Recent attendance sessions marked by me (last 7 days, distinct section+date)
      prisma.studentAttendance.findMany({
        where: {
          markedById: userId,
          date: { gte: sevenDaysAgo },
        },
        distinct: ['sectionId', 'date'],
        orderBy: { date: 'desc' },
        take: 3,
        select: {
          date: true,
          section: { select: { id: true, name: true } },
          subject: { select: { name: true } },
        },
      }),
    ])

  return {
    todaySchedule: todaySlots.map((s) => ({
      id: s.id,
      slotNumber: s.slotNumber,
      startTime: s.startTime,
      endTime: s.endTime,
      slotType: s.slotType,
      sectionName: s.section.name,
      subjectName: s.subject?.name ?? null,
    })),
    mySections: mySectionAssignments.map((a) => ({
      id: a.section.id,
      name: a.section.name,
      gradeName: a.section.grade.name,
      programName: a.section.grade.program.name,
      studentCount: a.section._count.students,
    })),
    upcomingExams: upcomingExams.map((e) => ({
      id: e.id,
      date: e.date.toISOString().split('T')[0],
      startTime: e.startTime,
      status: e.status,
      sectionName: e.section.name,
      subjectName: e.subject.name,
      examTypeName: e.examType.name,
    })),
    recentAttendance: recentAttendance.map((a) => ({
      date: a.date.toISOString().split('T')[0],
      sectionId: a.section.id,
      sectionName: a.section.name,
      subjectName: a.subject.name,
    })),
  }
}
