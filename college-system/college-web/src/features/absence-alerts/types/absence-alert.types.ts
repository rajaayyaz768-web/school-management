export interface FreeTeacher {
  id: string
  firstName: string
  lastName: string
  staffCode: string
  designation: string | null
}

export interface AffectedPeriod {
  slotNumber: number
  sectionId: string | null
  sectionName: string
  subjectName: string
  freeTeachers: FreeTeacher[]
}

export interface AbsenceAlert {
  staffId: string
  staffName: string
  staffCode: string
  designation: string | null
  date: string
  campusId: string
  affectedPeriods: AffectedPeriod[]
}
