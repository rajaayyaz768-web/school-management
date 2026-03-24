export interface Campus {
  id: string;
  name: string;
  campus_code: string;
  address: string | null;
  contact_number: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampusInput {
  name: string;
  campus_code: string;
  address?: string;
  contact_number?: string;
}

export interface UpdateCampusInput {
  name?: string;
  campus_code?: string;
  address?: string;
  contact_number?: string;
}
