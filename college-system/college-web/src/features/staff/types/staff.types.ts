export type EmploymentType = 'PERMANENT' | 'CONTRACT' | 'VISITING';
export type Gender = 'MALE' | 'FEMALE';

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  staffCode: string;
  designation: string | null;
  gender: Gender;
  joiningDate: string | null;
  photoUrl: string | null;
  phone: string | null;
  email: string | null;
  employmentType: EmploymentType;
  temporaryPassword?: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  campus: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface CreateStaffInput {
  firstName: string;
  lastName?: string;
  staffCode?: string;
  designation?: string;
  gender: Gender;
  joiningDate?: string;
  photoUrl?: string;
  phone?: string;
  email: string;
  primaryCampusId: string;
  employmentType: EmploymentType;
}

export interface UpdateStaffInput {
  firstName?: string;
  lastName?: string;
  staffCode?: string;
  designation?: string;
  gender?: Gender;
  joiningDate?: string;
  photoUrl?: string;
  phone?: string;
  email?: string;
  primaryCampusId?: string;
  employmentType?: EmploymentType;
}
