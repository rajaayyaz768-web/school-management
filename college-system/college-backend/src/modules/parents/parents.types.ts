import { Role, Relationship, StudentStatus } from "@prisma/client";

export interface CreateParentDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cnic?: string;
  occupation?: string;
  address?: string;
}

export interface UpdateParentDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  cnic?: string;
  occupation?: string;
  address?: string;
}

export interface LinkStudentDto {
  studentId: string;
  relationship: Relationship;
  isPrimary?: boolean;
}

export interface ParentResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  cnic: string | null;
  occupation: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    isActive: boolean;
  };
  studentLinks: {
    id: string;
    relationship: Relationship;
    isPrimary: boolean;
    student: {
      id: string;
      firstName: string;
      lastName: string;
      rollNumber: string | null;
      status: StudentStatus;
      section: {
        id: string;
        name: string;
      } | null;
    };
  }[];
}
