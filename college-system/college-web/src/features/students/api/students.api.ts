import axios from '@/lib/axios';
import {
  Student,
  PaginatedStudents,
  CreateStudentInput,
  UpdateStudentInput,
} from '../types/students.types';

export interface StudentFilters {
  campusId?: string;
  sectionId?: string;
  status?: string;
  gradeId?: string;
  page?: number;
  limit?: number;
}

export const fetchAllStudents = async (filters?: StudentFilters): Promise<PaginatedStudents> => {
  const params = new URLSearchParams();
  if (filters?.campusId) params.append('campus_id', filters.campusId);
  if (filters?.sectionId) params.append('section_id', filters.sectionId);
  if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters?.gradeId) params.append('grade_id', filters.gradeId);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const response = await axios.get<{ success: boolean; data: PaginatedStudents }>(
    `/students?${params.toString()}`
  );
  return response.data.data;
};

export const fetchStudentById = async (id: string): Promise<Student> => {
  const response = await axios.get<{ success: boolean; data: Student }>(`/students/${id}`);
  return response.data.data;
};

export const fetchUnassignedStudents = async (gradeId: string): Promise<Student[]> => {
  const response = await axios.get<{ success: boolean; data: Student[] }>(
    `/students/unassigned?grade_id=${gradeId}`
  );
  return response.data.data;
};

export const fetchStudentsBySection = async (sectionId: string): Promise<Student[]> => {
  const response = await axios.get<{ success: boolean; data: Student[] }>(
    `/students/by-section?section_id=${sectionId}`
  );
  return response.data.data;
};

export const createStudent = async (
  data: CreateStudentInput
): Promise<{ student: Student; temporaryPassword: string }> => {
  const response = await axios.post<{
    success: boolean;
    data: { student: Student; temporaryPassword: string };
  }>('/students', data);
  return response.data.data;
};

export const updateStudent = async (id: string, data: UpdateStudentInput): Promise<Student> => {
  const response = await axios.put<{ success: boolean; data: Student }>(`/students/${id}`, data);
  return response.data.data;
};

export interface MyStudentProfile extends Student {
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

export const fetchMyProfile = async (): Promise<MyStudentProfile> => {
  const response = await axios.get<{ success: boolean; data: MyStudentProfile }>('/students/me');
  return response.data.data;
};
