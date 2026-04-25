export interface AcademicYear {
  id: string;
  campusId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface GradePromotionStatus {
  gradeId: string;
  gradeName: string;
  displayOrder: number;
  isTransitional: boolean;
  teachingMode: string | null;
  activeStudentCount: number;
  destinationGradeId: string | null;
  destinationStudentCount: number;
  canPromote: boolean;
  blockedReason: string | null;
}

export type PromotionStudentStatus = 'PROMOTED' | 'DETAINED' | 'WITHDRAWN';

export interface PromotionStudentAssignment {
  studentId: string;
  toSectionId?: string | null;
  status: PromotionStudentStatus;
}

export interface RunTransitionalInput {
  academicYearId: string;
  assignments: PromotionStudentAssignment[];
}

export interface RunAnnualInput {
  academicYearId: string;
  gradeAssignments: {
    gradeId: string;
    studentAssignments: PromotionStudentAssignment[];
  }[];
}

export interface PromotionRunSummary {
  runId: string;
  promoted?: number;
  detained?: number;
  graduated?: number;
  withdrawn?: number;
}

export interface PromotionHistoryItem {
  id: string;
  type: 'TRANSITIONAL' | 'ANNUAL';
  status: string;
  academicYear: string;
  initiatedBy: { id: string; email: string };
  createdAt: string;
  completedAt: string | null;
  counts: Record<string, number>;
}
