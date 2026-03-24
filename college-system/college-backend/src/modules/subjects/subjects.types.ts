import { SubjectType } from "@prisma/client";

export interface CreateSubjectDto {
  name: string;
  code: string;
  type: SubjectType;
  credit_hours: number;
}

export interface UpdateSubjectDto {
  name?: string;
  code?: string;
  type?: SubjectType;
  credit_hours?: number;
}

export interface SubjectResponse {
  id: string;
  name: string;
  code: string;
  type: SubjectType;
  creditHours: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateSectionSubjectTeacherDto {
  sectionId: string;
  subjectId: string;
  staffId: string;
  academicYear: string;
}

export interface UpdateSectionSubjectTeacherDto {
  sectionId?: string;
  subjectId?: string;
  staffId?: string;
  academicYear?: string;
}

export interface SectionSubjectTeacherResponse {
  id: string;
  sectionId: string;
  subjectId: string;
  staffId: string;
  academicYear: string;
  createdAt: Date;
  section?: unknown;
  subject?: unknown;
  staff?: unknown;
}
