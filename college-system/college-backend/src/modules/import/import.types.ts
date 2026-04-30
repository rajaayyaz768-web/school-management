export interface ImportCsvRow {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  address?: string;
  fatherName?: string;
  fatherCnic?: string;
  guardianPhone?: string;
  rankingMarks?: string;
  existingRollNumber?: string;
  fatherFirstName?: string;
  fatherLastName?: string;
  relationship?: string;
}

export interface StudentImportRow {
  rowNumber: number;
  firstName: string;
  lastName: string;
  gender: string;
  dob?: string;
  phone?: string;
  address?: string;
  fatherName: string;
  fatherCnic: string;
  guardianPhone: string;
  rankingMarks?: number;
  existingRollNumber?: string;
  fatherFirstName: string;
  fatherLastName: string;
  relationship: string;
}

export interface RowIssue {
  code: string;
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

export interface RowValidationResult {
  rowNumber: number;
  studentName: string;
  status: 'READY' | 'WARNING' | 'ERROR';
  issues: RowIssue[];
  parentAction: 'CREATE' | 'LINK_EXISTING' | 'UNKNOWN';
  existingParentName?: string;
}

export interface ValidationReport {
  validationToken: string;
  sectionId: string;
  sectionName: string;
  campusName: string;
  totalRows: number;
  readyCount: number;
  warningCount: number;
  errorCount: number;
  newParentsToCreate: number;
  existingParentsToLink: number;
  siblingsDetected: number;
  wouldExceedCapacity: boolean;
  currentEnrollment: number;
  sectionCapacity: number;
  rows: RowValidationResult[];
}

export interface ImportResult {
  importId: string;
  sectionId: string;
  studentsCreated: number;
  parentsCreated: number;
  parentsLinked: number;
  siblingsLinked: number;
  importedAt: string;
}

export interface ImportHistoryRecord {
  id: string;
  importedAt: Date;
  studentsCreated: number;
  parentsCreated: number;
  parentsLinked: number;
  siblingsLinked: number;
  totalRows: number;
  credentialsDownloaded: boolean;
  importedBy: {
    firstName: string;
    lastName: string;
  };
}
