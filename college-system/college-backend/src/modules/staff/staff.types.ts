import { EmploymentType, Role } from "@prisma/client";

export interface CreateStaffDto {
  firstName: string;
  lastName?: string;
  email: string;
  primaryCampusId: string;
  staffCode: string;
  designation?: string;
  cnic?: string;
  phone?: string;
  joiningDate?: string;
  gender?: string;
  employmentType: EmploymentType;
  photoUrl?: string;
}

export interface UpdateStaffDto {
  firstName?: string;
  lastName?: string;
  primaryCampusId?: string;
  staffCode?: string;
  designation?: string;
  cnic?: string;
  phone?: string;
  joiningDate?: string;
  gender?: string;
  employmentType?: EmploymentType;
  photoUrl?: string;
  email?: string;
}

export interface StaffResponse {
  id: string;
  userId: string;
  staffCode: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  cnic: string | null;
  joiningDate: Date | null;
  employmentType: EmploymentType;
  designation: string | null;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    role: Role;
    isActive: boolean;
  };
  campus?: {
    id: string;
    name: string;
    code: string;
  };
}
