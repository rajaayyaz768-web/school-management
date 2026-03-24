import { EmploymentType, Role } from "@prisma/client";

export interface CreateStaffDto {
  fullName: string;
  email: string;
  primaryCampusId: string;
  employeeId: string;
  designation?: string;
  specialization?: string;
  cnic?: string;
  phone?: string;
  dateOfJoining?: string;
  employmentType: EmploymentType;
  profilePhotoUrl?: string;
}

export interface UpdateStaffDto {
  fullName?: string;
  primaryCampusId?: string;
  employeeId?: string;
  designation?: string;
  specialization?: string;
  cnic?: string;
  phone?: string;
  dateOfJoining?: string;
  employmentType?: EmploymentType;
  profilePhotoUrl?: string;
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
