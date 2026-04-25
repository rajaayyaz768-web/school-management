export interface AdminCampus {
  id: string;
  name: string;
}

export interface AdminStaffProfile {
  id: string;
  firstName: string;
  lastName: string;
  staffCode: string;
}

export interface Admin {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  staffProfile: AdminStaffProfile | null;
  campus: AdminCampus | null;
}

export interface CreateAdminInput {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  employeeCode?: string;
  campusId: string;
}
