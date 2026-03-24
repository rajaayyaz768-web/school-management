export interface Grade {
  id: string;
  name: string;
  displayOrder: number;
  is_active: boolean;
}

export interface ProgramListItem {
  id: string;
  name: string;
  campus_code: string;
}

export interface Program {
  id: string;
  campus_id: string;
  name: string;
  code: string;
  durationYears: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  campus: {
    id: string;
    name: string;
    campus_code: string;
  };
  grades: [
    { id: string; name: string; displayOrder: number; is_active: boolean },
    { id: string; name: string; displayOrder: number; is_active: boolean }
  ];
}

export interface CreateProgramInput {
  campus_id: string;
  name: string;
  code: string;
  durationYears?: number;
}

export interface UpdateProgramInput {
  campus_id?: string;
  name?: string;
  code?: string;
  durationYears?: number;
}
