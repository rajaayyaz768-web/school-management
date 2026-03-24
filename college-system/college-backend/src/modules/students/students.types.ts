import { Gender, StudentStatus, Role } from "@prisma/client";

export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  gender: Gender;
  campusId: string;
  gradeId: string; // Used for validation context, not stored on student
  dob?: string;
  phone?: string;
  guardianPhone?: string;
  address?: string;
  photoUrl?: string;
  rankingMarks?: number;
  email: string;
  enrollmentDate?: string;
}

export interface UpdateStudentDto {
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

export interface StudentResponse {
  id: string;
  userId: string;
  rollNumber: string | null;
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: Date | null;
  phone: string | null;
  address: string | null;
  guardianPhone: string | null;
  sectionId: string | null;
  campusId: string;
  enrollmentDate: Date;
  status: StudentStatus;
  photoUrl: string | null;
  rankingMarks: number | null;
  createdAt: Date;
  updatedAt: Date;
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
