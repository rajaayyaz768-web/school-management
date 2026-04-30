export type TeachingMode = 'SUBJECT_WISE' | 'CLASS_TEACHER' | 'DUAL_TEACHER';

export interface Grade {
  id: string;
  name: string;
  displayOrder: number;
  is_active: boolean;
  teachingMode: TeachingMode | null;
  isTransitional: boolean;
}

export interface ProgramListItem {
  id: string;
  name: string;
  campus_code: string;
}

export interface Program {
  id: string;
  campus_id: string;
  name: string;
  code: string;
  durationYears: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  campus: {
    id: string;
    name: string;
    code: string;
    campus_type: 'SCHOOL' | 'COLLEGE';
  };
  grades: Grade[];
}

export interface CreateProgramInput {
  campus_id: string;
  name: string;
  code: string;
  durationYears?: number;
}

export interface UpdateProgramInput {
  campus_id?: string;
  name?: string;
  code?: string;
  durationYears?: number;
}
