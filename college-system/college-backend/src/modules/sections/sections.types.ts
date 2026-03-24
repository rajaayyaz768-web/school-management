export interface CreateSectionDto {
  grade_id: string;
  campus_id: string;
  name: string;
  room_number?: string;
  academic_year: string;
  max_students?: number;
  class_teacher_id?: string;
}

export interface UpdateSectionDto {
  grade_id?: string;
  campus_id?: string;
  name?: string;
  room_number?: string;
  academic_year?: string;
  max_students?: number;
  class_teacher_id?: string;
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
