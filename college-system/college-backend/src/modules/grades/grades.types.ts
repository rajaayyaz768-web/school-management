export interface UpdateGradeDto {
  name?: string;
  is_active?: boolean;
  teaching_mode?: "SUBJECT_WISE" | "CLASS_TEACHER" | "DUAL_TEACHER";
  is_transitional?: boolean;
  displayOrder?: number;
}

export interface GradeResponse {
  id: string;
  programId: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date; // Optional since schema doesn't have it natively
  program?: unknown;
}
