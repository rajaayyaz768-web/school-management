export interface UpdateGradeDto {
  name?: string;
  is_active?: boolean;
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
