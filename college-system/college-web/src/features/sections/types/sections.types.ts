export interface GradeFilterItem {
  id: string;
  name: string;
  displayOrder: number;
}

export interface Section {
  id: string;
  name: string;
  gradeId: string;
  roomNumber: string | null;
  capacity: number;
  isActive: boolean;
  createdAt: string;
  grade: {
    id: string;
    name: string;
    displayOrder: number;
    program: {
      id: string;
      name: string;
      code: string;
      campus: {
        id: string;
        name: string;
        campus_code?: string;
        code?: string;
      };
    };
  };
  // Enriched fields from UX-0B backend changes
  studentCount?: number;
  programId?: string | null;
  programName?: string | null;
  programCode?: string | null;
  gradeName?: string | null;
  campusId?: string | null;
}

export interface CreateSectionInput {
  gradeId: string;
  name: string;
  roomNumber?: string;
  capacity?: number;
}

export interface UpdateSectionInput {
  gradeId?: string;
  name?: string;
  roomNumber?: string;
  capacity?: number;
}
