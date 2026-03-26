export interface CreateProgramDto {
  campus_id: string;
  name: string;
  code: string;
  durationYears?: number;
}

export interface UpdateProgramDto {
  campus_id?: string;
  name?: string;
  code?: string;
  durationYears?: number;
}

export interface ProgramResponse {
  id: string;
  campusId: string;
  name: string;
  code: string;
  durationYears: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  campus?: unknown;
  grades?: unknown[];
}
