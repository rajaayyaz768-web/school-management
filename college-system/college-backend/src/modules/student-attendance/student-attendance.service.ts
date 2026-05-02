import { AttendanceStatus, Role } from '@prisma/client'
import prisma from '../../config/database'
import { assertSectionCampus, assertStudentCampus, assertTeacherSubjectAccess } from '../../utils/campusGuard'
import {
  MarkStudentAttendanceDto,
  UpdateStudentAttendanceDto,
  StudentAttendanceResponse,
  StudentWithAttendance,
  SectionAttendanceReport,
  StudentAttendanceSummary
} from './student-attendance.types'

interface RequestUser { id: string; role: Role; campusId: string | null }

const studentAttendanceInclude = {
  student: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      rollNumber: true,
      photoUrl: true,
    }
  },
  subject: {
    select: {
      id: true,
      name: true,
      code: true,
    }
  },
  section: {
    select: {
      id: true,
      name: true,
    }
  }
}

function mapToResponse(record: any): StudentAttendanceResponse {
  return {
    id: record.id,
    studentId: record.studentId,
    subjectId: record.subjectId,
    sectionId: record.sectionId,
    date: record.date instanceof Date
      ? record.date.toISOString().split('T')[0]
      : record.date,
    status: record.status,
    remarks: record.remarks ?? null,
    markedById: record.markedById,
    createdAt: record.createdAt.toISOString(),
    student: {
      id: record.student.id,
      firstName: record.student.firstName,
      lastName: record.student.lastName,
      rollNumber: record.student.rollNumber ?? null,
      photoUrl: record.student.photoUrl ?? null,
    },
    subject: {
      id: record.subject.id,
      name: record.subject.name,
      code: record.subject.code,
    },
    section: {
      id: record.section.id,
      name: record.section.name,
    }
  }
}

function getDateRange(dateStr: string) {
  return {
    gte: new Date(dateStr + 'T00:00:00.000Z'),
    lte: new Date(dateStr + 'T23:59:59.999Z'),
  }
}

export const getStudentsForAttendance = async (sectionId: string, subjectId: string, date: string, user?: RequestUser): Promise<StudentWithAttendance[]> => {
  if (user) await assertSectionCampus(sectionId, user)
  const students = await prisma.studentProfile.findMany({
    where: { sectionId, status: 'ACTIVE' },
    select: { id: true, firstName: true, lastName: true, rollNumber: true, photoUrl: true },
    orderBy: { rollNumber: 'asc' }
  })

  const records = await Promise.all(students.map(async (student) => {
    const record = await prisma.studentAttendance.findFirst({
      where: {
        studentId: student.id,
        subjectId,
        date: getDateRange(date)
      },
      include: studentAttendanceInclude
    })

    return {
      student,
      attendance: record ? mapToResponse(record) : null
    }
  }))

  return records
}

export const markStudentAttendance = async (data: MarkStudentAttendanceDto, markedById: string, user?: RequestUser): Promise<SectionAttendanceReport> => {
  if (user) {
    await assertSectionCampus(data.sectionId, user)
    await assertTeacherSubjectAccess(data.sectionId, data.subjectId, user)
    await Promise.all(data.attendances.map((item) => assertStudentCampus(item.studentId, user)))
  }
  await Promise.all(data.attendances.map((item) => prisma.studentAttendance.upsert({
    where: { studentId_subjectId_date: { studentId: item.studentId, subjectId: data.subjectId, date: new Date(data.date) } },
    create: { studentId: item.studentId, subjectId: data.subjectId, sectionId: data.sectionId, date: new Date(data.date), status: item.status, remarks: item.remarks, markedById },
    update: { status: item.status, remarks: item.remarks, markedById }
  })))

  return getSectionAttendanceReport(data.sectionId, data.subjectId, data.date)
}

export const updateStudentAttendance = async (id: string, data: UpdateStudentAttendanceDto, user?: RequestUser): Promise<StudentAttendanceResponse> => {
  const record = await prisma.studentAttendance.findUnique({ where: { id }, include: studentAttendanceInclude })
  if (!record) {
    const error = new Error('Attendance record not found') as any
    error.status = 404
    throw error
  }
  if (user) await assertSectionCampus(record.sectionId, user)

  const updated = await prisma.studentAttendance.update({ where: { id }, data, include: studentAttendanceInclude })
  return mapToResponse(updated)
}

export const getSectionAttendanceReport = async (sectionId: string, subjectId: string, date: string, user?: RequestUser): Promise<SectionAttendanceReport> => {
  if (user) await assertSectionCampus(sectionId, user)
  const records = await prisma.studentAttendance.findMany({
    where: { sectionId, subjectId, date: getDateRange(date) },
    include: studentAttendanceInclude
  })

  const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length
  const absent = records.filter((r) => r.status === AttendanceStatus.ABSENT).length
  const late = records.filter((r) => r.status === AttendanceStatus.LATE).length
  const leave = records.filter((r) => r.status === AttendanceStatus.LEAVE).length

  return {
    date,
    sectionId,
    subjectId,
    totalStudents: records.length,
    present,
    absent,
    late,
    onLeave: leave,
    attendances: records.map(mapToResponse)
  }
}

export const getStudentAttendanceSummary = async (studentId: string, subjectId?: string, user?: RequestUser): Promise<StudentAttendanceSummary> => {
  if (user) await assertStudentCampus(studentId, user)
  const student = await prisma.studentProfile.findUnique({ where: { id: studentId }, select: { id: true, firstName: true, lastName: true, rollNumber: true, photoUrl: true } })
  if (!student) {
    const error = new Error('Attendance record not found') as any
    error.status = 404
    throw error
  }

  const records = await prisma.studentAttendance.findMany({
    where: {
      studentId,
      ...(subjectId ? { subjectId } : {})
    }
  })

  const totalDays = records.length
  const presentDays = records.filter((r) => r.status === AttendanceStatus.PRESENT).length
  const absentDays = records.filter((r) => r.status === AttendanceStatus.ABSENT).length
  const lateDays = records.filter((r) => r.status === AttendanceStatus.LATE).length
  const leaveDays = records.filter((r) => r.status === AttendanceStatus.LEAVE).length
  const attendancePercentage = totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0

  return {
    studentId,
    student,
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    leaveDays,
    attendancePercentage,
  }
}

export const getStudentAttendanceHistory = async (studentId: string, filters: { subjectId?: string, month?: number, year?: number }, user?: RequestUser) => {
  if (user) await assertStudentCampus(studentId, user)
  const where: any = {
    studentId,
    ...(filters.subjectId ? { subjectId: filters.subjectId } : {})
  }

  if (filters.month && filters.year) {
    where.date = {
      gte: new Date(Date.UTC(filters.year, filters.month - 1, 1, 0, 0, 0, 0)),
      lte: new Date(Date.UTC(filters.year, filters.month, 0, 23, 59, 59, 999))
    }
  }

  const records = await prisma.studentAttendance.findMany({
    where,
    include: studentAttendanceInclude,
    orderBy: {
      date: 'desc'
    }
  })

  return records.map(mapToResponse)
}