export type Relationship = 'FATHER' | 'MOTHER' | 'GUARDIAN';

export interface StudentLink {
  id: string;
  relationship: Relationship;
  isPrimary: boolean;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    rollNumber: string | null;
    status: string;
    section: {
      id: string;
      name: string;
    } | null;
  };
}

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  cnic: string | null;
  occupation: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    isActive: boolean;
  };
  studentLinks: StudentLink[];
}

export interface CreateParentInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cnic?: string;
  occupation?: string;
  address?: string;
}

export interface UpdateParentInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  cnic?: string;
  occupation?: string;
  address?: string;
}

export interface LinkStudentInput {
  studentId: string;
  relationship: Relationship;
  isPrimary: boolean;
}

export interface MyChildStudent {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string | null;
  status: string;
  section: {
    id: string;
    name: string;
    grade: {
      id: string;
      name: string;
      program: {
        id: string;
        name: string;
        code: string;
        campus: {
          id: string;
          name: string;
          campusCode: string;
        };
      };
    } | null;
  } | null;
}

export interface MyChild {
  relationship: Relationship;
  isPrimary: boolean;
  student: MyChildStudent;
}
