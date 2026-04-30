import axios from '@/lib/axios';
import {
  Parent,
  MyChild,
  CreateParentInput,
  UpdateParentInput,
  LinkStudentInput,
} from '../types/parents.types';

export interface ParentPage {
  data: Parent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchAllParents = async (search?: string): Promise<Parent[]> => {
  const url = search ? `/parents?search=${encodeURIComponent(search)}` : '/parents';
  const response = await axios.get<{ success: boolean; data: ParentPage }>(url);
  return response.data.data?.data ?? (response.data.data as unknown as Parent[]);
};

export const fetchParentsPage = async (search: string | undefined, page: number): Promise<ParentPage> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  params.append('page', String(page));
  params.append('limit', '20');
  const response = await axios.get(`/parents?${params.toString()}`);
  return response.data.data;
};

export const fetchParentById = async (id: string): Promise<Parent> => {
  const response = await axios.get<{ success: boolean; data: Parent }>(`/parents/${id}`);
  return response.data.data;
};

export const fetchParentsByStudent = async (studentId: string): Promise<Parent[]> => {
  const response = await axios.get<{ success: boolean; data: Parent[] }>(
    `/parents/by-student?student_id=${studentId}`
  );
  return response.data.data;
};

export const createParent = async (
  data: CreateParentInput
): Promise<{ parent: Parent; temporaryPassword: string; autoLinkedStudents: number }> => {
  const response = await axios.post<{
    success: boolean;
    data: { parent: Parent; temporaryPassword: string; autoLinkedStudents: number };
  }>('/parents', data);
  return response.data.data;
};

export const updateParent = async (id: string, data: UpdateParentInput): Promise<Parent> => {
  const response = await axios.put<{ success: boolean; data: Parent }>(`/parents/${id}`, data);
  return response.data.data;
};

export const linkStudent = async (parentId: string, data: LinkStudentInput): Promise<Parent> => {
  const response = await axios.post<{ success: boolean; data: Parent }>(
    `/parents/${parentId}/link-student`,
    data
  );
  return response.data.data;
};

export const unlinkStudent = async (parentId: string, studentId: string): Promise<void> => {
  await axios.delete(`/parents/${parentId}/unlink-student/${studentId}`);
};

export const fetchMyChildren = async (): Promise<MyChild[]> => {
  const response = await axios.get<{ success: boolean; data: MyChild[] }>('/parents/my-children');
  return response.data.data;
};
