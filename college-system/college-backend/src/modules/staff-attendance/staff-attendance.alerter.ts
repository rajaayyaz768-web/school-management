import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function buildAbsenceAlert(staffId: string, campusId: string, date: string) {
  // Step 1 — Fetch the absent staff member
  const staff = await prisma.staffProfile.findUnique({
    where: { id: staffId },
    select: { id: true, firstName: true, lastName: true, staffCode: true, designation: true }
  })
  if (!staff) return null

  // Step 2 — Get today's day of week from the date parameter
  const dayOfWeek = ['SUN','MON','TUE','WED','THU','FRI','SAT'][new Date(date).getDay()]

  // Step 3 — Find all timetable slots for this staff member on this day
  const affectedSlots = await prisma.timetableSlot.findMany({
    where: {
      staffId,
      dayOfWeek: dayOfWeek as any,
    },
    include: {
      section: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true } },
    },
    orderBy: { slotNumber: 'asc' }
  })

  // Step 4 — For each affected slot find free teachers at that slot number
  const slotsWithFreeTeachers = await Promise.all(
    affectedSlots.map(async (slot) => {
      const busyStaffIds = await prisma.timetableSlot.findMany({
        where: {
          dayOfWeek: slot.dayOfWeek,
          slotNumber: slot.slotNumber,
          staffId: { not: null }
        },
        select: { staffId: true }
      })
      const busyIds = busyStaffIds.map(s => s.staffId).filter(Boolean)

      const freeTeachers = await prisma.staffCampusAssignment.findMany({
        where: {
          campusId,
          staffId: { notIn: busyIds as string[] }
        },
        include: {
          staff: {
            select: { id: true, firstName: true, lastName: true, staffCode: true, designation: true }
          }
        }
      })

      return {
        slotNumber: slot.slotNumber,
        sectionId: slot.section?.id ?? null,
        sectionName: slot.section?.name ?? 'Unknown',
        subjectName: slot.subject?.name ?? 'Unknown',
        freeTeachers: freeTeachers.map(ft => ({
          id: ft.staff.id,
          firstName: ft.staff.firstName,
          lastName: ft.staff.lastName,
          staffCode: ft.staff.staffCode,
          designation: ft.staff.designation ?? null,
        }))
      }
    })
  )

  // Step 5 — Return the complete alert object
  return {
    staffId: staff.id,
    staffName: `${staff.firstName} ${staff.lastName}`,
    staffCode: staff.staffCode,
    designation: staff.designation ?? null,
    date,
    campusId,
    affectedPeriods: slotsWithFreeTeachers
  }
}
