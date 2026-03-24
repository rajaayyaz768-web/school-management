export type SubjectType = 'THEORY' | 'PRACTICAL' | 'BOTH';

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: SubjectType;
  creditHours: number;
  isActive: boolean;
  createdAt: string;
}

export interface SectionSubjectTeacher {
  id: string;
  sectionId: string;
  subjectId: string;
  staffId: string;
  academicYear: string;
  createdAt: string;
  section?: {
    id: string;
    name: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
    staffCode?: string;
  };
}

export interface CreateSubjectInput {
  name: string;
  code: string;
  type: SubjectType;
  creditHours: number;
}

export interface UpdateSubjectInput {
  name?: string;
  code?: string;
  type?: SubjectType;
  creditHours?: number;
}

export interface CreateAssignmentInput {
  sectionId: string;
  subjectId: string;
  staffId: string;
  academicYear: string;
}

export interface UpdateAssignmentInput {
  sectionId?: string;
  subjectId?: string;
  staffId?: string;
  academicYear?: string;
}
