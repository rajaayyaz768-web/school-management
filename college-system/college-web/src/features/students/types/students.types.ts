export type StudentStatus = 'UNASSIGNED' | 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'WITHDRAWN';
export type Gender = 'MALE' | 'FEMALE';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: string | null;
  phone: string | null;
  guardianPhone: string | null;
  address: string | null;
  photoUrl: string | null;
  rankingMarks: number | null;
  rollNumber: string | null;
  sectionId: string | null;
  campusId: string;
  enrollmentDate: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    isActive: boolean;
  };
  section: {
    id: string;
    name: string;
  } | null;
  campus: {
    id: string;
    name: string;
    code: string;
  };
}

export interface PaginatedStudents {
  data: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  gender: Gender;
  email: string;
  campusId: string;
  gradeId: string;
  dob?: string;
  phone?: string;
  guardianPhone?: string;
  address?: string;
  photoUrl?: string;
  rankingMarks?: number;
  enrollmentDate?: string;
}

export interface UpdateStudentInput {
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  dob?: string;
  phone?: string;
  guardianPhone?: string;
  address?: string;
  photoUrl?: string;
  rankingMarks?: number;
  enrollmentDate?: string;
  campusId?: string;
}
