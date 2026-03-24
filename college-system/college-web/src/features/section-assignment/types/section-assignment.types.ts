export interface UnassignedStudent {
  id: string;
  firstName: string;
  lastName: string;
  rankingMarks: number | null;
}

export interface SectionInfo {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
}

export interface AssignmentData {
  grade: { id: string; name: string; displayOrder: number };
  program: { id: string; name: string; code: string };
  campus: { id: string; name: string; code: string };
  unassignedStudents: UnassignedStudent[];
  sections: SectionInfo[];
}

export interface AssignmentPreview {
  sectionId: string;
  sectionName: string;
  students: UnassignedStudent[];
}

export interface ManualAssignment {
  studentId: string;
  sectionId: string;
}

export interface ConfirmAssignmentInput {
  gradeId: string;
  assignments: ManualAssignment[];
}

export interface AssignmentResult {
  totalAssigned: number;
  assignments: {
    studentId: string;
    studentName: string;
    sectionName: string;
    rollNumber: string;
  }[];
  skipped: {
    studentId: string;
    reason: string;
  }[];
}
