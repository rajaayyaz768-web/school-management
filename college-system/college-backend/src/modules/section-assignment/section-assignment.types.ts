export interface StudentAssignmentItem {
  id: string;
  firstName: string;
  lastName: string;
  rankingMarks: number | null;
  currentSectionId: string | null;
}

export interface SectionCapacityItem {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
}

export interface ManualAssignment {
  studentId: string;
  sectionId: string;
}

export interface AssignmentPreview {
  sectionId: string;
  sectionName: string;
  students: StudentAssignmentItem[];
}

export interface ConfirmAssignmentDto {
  gradeId: string;
  assignments: ManualAssignment[];
}
