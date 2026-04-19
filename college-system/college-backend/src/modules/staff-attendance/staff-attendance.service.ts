import { StaffAttendanceStatus } from '@prisma/client'
import prisma from '../../config/database'
import { MarkStaffAttendanceDto, UpdateAttendanceDto, StaffAttendanceResponse, StaffWithAttendance, DailyAttendanceReport } from './staff-attendance.types'

function mapToResponse(record: any): StaffAttendanceResponse {
  return {
    id: record.id,
    staffId: record.staffId,
    campusId: record.campusId,
    date: record.date.toISOString().split('T')[0],
    status: record.status,
    checkIn: record.checkIn ? record.checkIn.toISOString() : null,
    checkOut: record.checkOut ? record.checkOut.toISOString() : null,
    remarks: record.remarks ?? null,
    markedById: record.markedById ?? null,
    createdAt: record.createdAt.toISOString(),
    staff: {
      id: record.staff.id,
      firstName: record.staff.firstName,
      lastName: record.staff.lastName,
      staffCode: record.staff.staffCode,
      designation: record.staff.designation ?? null,
      photoUrl: record.staff.photoUrl ?? null,
    }
  }
}

const staffAttendanceInclude = {
  staff: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      staffCode: true,
      designation: true,
      photoUrl: true,
    }
  }
}

export const getStaffForAttendance = async (campusId: string, date: string): Promise<StaffWithAttendance[]> => {
  const startOfDay = new Date(date + 'T00:00:00.000Z')
  const endOfDay = new Date(date + 'T23:59:59.999Z')

  const assignments = await prisma.staffCampusAssignment.findMany({
    where: { campusId },
    include: {
      staff: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          staffCode: true,
          designation: true,
          photoUrl: true,
        }
      }
    },
    orderBy: {
      staff: {
        firstName: 'asc'
      }
    }
  })

  const results = await Promise.all(assignments.map(async (assignment) => {
    const attendance = await prisma.staffAttendance.findFirst({
      where: {
        staffId: assignment.staffId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        }
      },
      include: staffAttendanceInclude,
    })

    return {
      staff: {
        id: assignment.staff.id,
        firstName: assignment.staff.firstName,
        lastName: assignment.staff.lastName,
        staffCode: assignment.staff.staffCode,
        designation: assignment.staff.designation ?? null,
        photoUrl: assignment.staff.photoUrl ?? null,
      },
      attendance: attendance ? mapToResponse(attendance) : null,
    }
  }))

  return results
}

export const markDailyAttendance = async (data: MarkStaffAttendanceDto, markedById: string): Promise<DailyAttendanceReport> => {
  await Promise.all(data.attendances.map((item) =>
    prisma.staffAttendance.upsert({
      where: { staffId_date: { staffId: item.staffId, date: new Date(data.date) } },
      create: {
        staffId: item.staffId,
        campusId: data.campusId,
        date: new Date(data.date),
        status: item.status,
        checkIn: item.checkIn ? new Date(item.checkIn) : null,
        checkOut: item.checkOut ? new Date(item.checkOut) : null,
        remarks: item.remarks,
        markedById,
      },
      update: {
        status: item.status,
        checkIn: item.checkIn ? new Date(item.checkIn) : null,
        checkOut: item.checkOut ? new Date(item.checkOut) : null,
        remarks: item.remarks,
        markedById,
      }
    })
  ))

  return getDailyReport(data.campusId, data.date)
}

export const updateSingleAttendance = async (id: string, data: UpdateAttendanceDto): Promise<StaffAttendanceResponse> => {
  const existing = await prisma.staffAttendance.findUnique({ where: { id }, include: staffAttendanceInclude })

  if (!existing) {
    const error = new Error('Attendance record not found') as any
    error.status = 404
    throw error
  }

  const updated = await prisma.staffAttendance.update({
    where: { id },
    data: {
      status: data.status,
      remarks: data.remarks,
      checkIn: data.checkIn !== undefined ? new Date(data.checkIn) : undefined,
      checkOut: data.checkOut !== undefined ? new Date(data.checkOut) : undefined,
    },
    include: staffAttendanceInclude,
  })
  return mapToResponse(updated)
}

export const getDailyReport = async (campusId: string, date: string): Promise<DailyAttendanceReport> => {
  const startOfDay = new Date(date + 'T00:00:00.000Z')
  const endOfDay = new Date(date + 'T23:59:59.999Z')

  const [records, totalStaff] = await Promise.all([
    prisma.staffAttendance.findMany({
      where: {
        campusId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: staffAttendanceInclude,
    }),
    prisma.staffCampusAssignment.count({ where: { campusId, removedAt: null } }),
  ])

  const present = records.filter((r) => r.status === StaffAttendanceStatus.PRESENT).length
  const absent = records.filter((r) => r.status === StaffAttendanceStatus.ABSENT).length
  const onLeave = records.filter((r) => r.status === StaffAttendanceStatus.ON_LEAVE).length
  const halfDay = records.filter((r) => r.status === StaffAttendanceStatus.HALF_DAY).length
  const holiday = records.filter((r) => r.status === StaffAttendanceStatus.HOLIDAY).length

  return {
    date,
    campusId,
    totalStaff,
    present,
    absent,
    onLeave,
    halfDay,
    holiday,
    attendances: records.map(mapToResponse),
  }
}

export const getStaffAttendanceHistory = async (staffId: string, month?: number, year?: number) => {
  const where: any = { staffId }

  if (month && year) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
    where.date = {
      gte: startDate,
      lte: endDate,
    }
  }

  const records = await prisma.staffAttendance.findMany({
    where,
    include: staffAttendanceInclude,
    orderBy: {
      date: 'desc',
    },
  })

  const mappedRecords = records.map(mapToResponse)

  return {
    records: mappedRecords,
    summary: {
      totalDays: mappedRecords.length,
      presentDays: mappedRecords.filter((r) => r.status === StaffAttendanceStatus.PRESENT).length,
      absentDays: mappedRecords.filter((r) => r.status === StaffAttendanceStatus.ABSENT).length,
      leaveDays: mappedRecords.filter((r) => r.status === StaffAttendanceStatus.ON_LEAVE).length,
    }
  }
}

export const getAbsentStaffToday = async (campusId: string, date: string): Promise<StaffAttendanceResponse[]> => {
  const startOfDay = new Date(date + 'T00:00:00.000Z')
  const endOfDay = new Date(date + 'T23:59:59.999Z')

  const records = await prisma.staffAttendance.findMany({
    where: {
      campusId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: StaffAttendanceStatus.ABSENT,
    },
    include: staffAttendanceInclude,
  })

  return records.map(mapToResponse)
}