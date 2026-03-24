import axios from '@/lib/axios';
import {
  Parent,
  CreateParentInput,
  UpdateParentInput,
  LinkStudentInput,
} from '../types/parents.types';

export const fetchAllParents = async (search?: string): Promise<Parent[]> => {
  const url = search ? `/parents?search=${encodeURIComponent(search)}` : '/parents';
  const response = await axios.get<{ success: boolean; data: Parent[] }>(url);
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
): Promise<{ parent: Parent; temporaryPassword: string }> => {
  const response = await axios.post<{
    success: boolean;
    data: { parent: Parent; temporaryPassword: string };
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
