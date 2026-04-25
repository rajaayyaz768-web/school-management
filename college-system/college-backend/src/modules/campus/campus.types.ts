export interface CreateCampusDto {
  name: string;
  campus_code: string;
  campus_type?: "SCHOOL" | "COLLEGE";
  address?: string;
  contact_number?: string;
}

export interface UpdateCampusDto {
  name?: string;
  campus_code?: string;
  campus_type?: "SCHOOL" | "COLLEGE";
  address?: string;
  contact_number?: string;
}

export interface CampusResponse {
  id: string;
  name: string;
  campus_code: string;
  campus_type: "SCHOOL" | "COLLEGE";
  address: string | null;
  contact_number: string | null;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
