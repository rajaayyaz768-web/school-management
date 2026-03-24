export type EmploymentType = 'PERMANENT' | 'CONTRACT' | 'VISITING';
export type Gender = 'MALE' | 'FEMALE';

export interface CampusAssignment {
  id: string;
  campus: {
    id: string;
    name: string;
    campusCode?: string;
    code?: string;
  };
}

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
  isActive?: boolean; // Technically derived from user.isActive on the backend, included for optional direct parsing if nested
  createdAt: string;
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  campusAssignments: CampusAssignment[];
}

export interface CreateStaffInput {
  firstName: string;
  lastName: string;
  staffCode: string;
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
