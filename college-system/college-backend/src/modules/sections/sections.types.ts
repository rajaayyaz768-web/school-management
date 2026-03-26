export interface CreateSectionDto {
  gradeId: string;
  name: string;
  roomNumber?: string;
  capacity?: number;
}

export interface UpdateSectionDto {
  gradeId?: string;
  name?: string;
  roomNumber?: string;
  capacity?: number;
}

export interface SectionResponse {
  id: string;
  gradeId: string;
  name: string;
  roomNumber: string | null;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
  grade?: unknown;
  campus?: unknown;
  classTeacher?: unknown;
}
