export interface CampusCardData {
  id: string;
  name: string;
  campus_code: string;
  student_count: number;
  staff_count: number;
  is_active: boolean;
}

export interface SectionCardData {
  id: string;
  name: string;
  programName: string | null;
  programCode: string | null;
  gradeName: string | null;
  studentCount: number;
  capacity: number;
}

export interface ProgramCardData {
  id: string;
  name: string;
  code: string;
  durationYears: number;
}

export interface SelectionState {
  campusId: string | null;
  campusName: string | null;
  programId: string | null;
  programName: string | null;
  gradeId: string | null;
  gradeName: string | null;
  sectionId: string | null;
  sectionName: string | null;
}
