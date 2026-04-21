export type FeeStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'WAIVED' | 'OVERDUE';

export interface FeeStructureResponse {
  id: string;
  programId: string;
  gradeId: string;
  campusId: string;
  academicYear: string;
  admissionFee: number;
  tuitionFee: number;
  examFee: number;
  miscFee: number;
  lateFeePerDay: number;
  totalFee: number;
  createdAt: string;
  updatedAt: string;
  program: {
    id: string;
    name: string;
    code: string;
  };
  grade: {
    id: string;
    name: string;
    displayOrder: number;
  };
  campus: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CreateFeeStructureInput {
  programId: string;
  gradeId: string;
  campusId: string;
  academicYear: string;
  admissionFee: number;
  tuitionFee: number;
  examFee: number;
  miscFee: number;
  lateFeePerDay: number;
}

export interface UpdateFeeStructureInput {
  admissionFee?: number;
  tuitionFee?: number;
  examFee?: number;
  miscFee?: number;
  lateFeePerDay?: number;
}

export interface FeeRecordResponse {
  id: string;
  studentId: string;
  feeStructureId: string;
  academicYear: string;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  discount: number;
  status: FeeStatus;
  paidAt: string | null;
  receiptNumber: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    rollNumber: string | null;
  };
  feeStructure: {
    id: string;
    totalFee: number;
    academicYear: string;
    program: {
      id: string;
      name: string;
    };
    grade: {
      id: string;
      name: string;
    };
  };
}

export interface MarkAsPaidInput {
  amountPaid: number;
  receiptNumber: string;
  discount?: number;
}

export interface GenerateFeeRecordsInput {
  feeStructureId: string;
  sectionId: string;
}

export interface FeeDefaulter {
  studentId: string;
  firstName: string;
  lastName: string;
  rollNumber: string | null;
  totalDue: number;
  totalPaid: number;
  balance: number;
  overdueRecords: number;
}


export interface FeeChalanData {
  id: string;
  receiptNumber: string | null;
  dueDate: string;
  paidAt: string | null;
  amountDue: number;
  amountPaid: number;
  discount: number;
  status: FeeStatus;
  student: { id: string; firstName: string; lastName: string; rollNumber: string | null };
  section: { id: string; name: string } | null;
  grade: { id: string; name: string } | null;
  program: { id: string; name: string; code: string } | null;
  campus: { id: string; name: string; code: string } | null;
  feeStructure: {
    id: string;
    academicYear: string;
    totalFee: number;
    admissionFee: number;
    tuitionFee: number;
    examFee: number;
    miscFee: number;
  };
  parentPhone: string | null;
}
