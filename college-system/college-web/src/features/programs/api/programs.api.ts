import axios from '@/lib/axios';
import { Program, CreateProgramInput, UpdateProgramInput, TeachingMode } from '../types/programs.types';

export interface UpdateGradeInput {
  name?: string;
  teaching_mode?: TeachingMode;
  is_transitional?: boolean;
  displayOrder?: number;
}

export const updateGrade = async (gradeId: string, data: UpdateGradeInput) => {
  const response = await axios.put(`/grades/${gradeId}`, data);
  return response.data.data;
};

export const createGrade = async (data: { programId: string; name: string; displayOrder?: number }) => {
  const response = await axios.post('/grades', data);
  return response.data.data;
};

export const fetchSubjectsByGrade = async (gradeId: string) => {
  const response = await axios.get(`/grades/${gradeId}/subjects`);
  return response.data.data as import('@/features/subjects/types/subjects.types').Subject[];
};

export const addSubjectToGrade = async (gradeId: string, subjectId: string) => {
  const response = await axios.post(`/grades/${gradeId}/subjects`, { subjectId });
  return response.data.data;
};

export const removeSubjectFromGrade = async (gradeId: string, subjectId: string) => {
  await axios.delete(`/grades/${gradeId}/subjects/${subjectId}`);
};

export const fetchAllPrograms = async (campusId?: string): Promise<Program[]> => {
  const url = campusId ? `/programs?campus_id=${campusId}` : '/programs';
  const response = await axios.get(url);
  return response.data.data;
};

export const fetchProgramById = async (id: string): Promise<Program> => {
  const response = await axios.get(`/programs/${id}`);
  return response.data.data;
};

export const createProgram = async (data: CreateProgramInput): Promise<Program> => {
  const response = await axios.post('/programs', data);
  return response.data.data;
};

export const updateProgram = async (id: string, data: UpdateProgramInput): Promise<Program> => {
  const response = await axios.put(`/programs/${id}`, data);
  return response.data.data;
};

export const toggleProgramStatus = async (id: string): Promise<Program> => {
  const response = await axios.patch(`/programs/${id}/toggle`);
  return response.data.data;
};

export const deleteProgram = async (id: string): Promise<void> => {
  await axios.delete(`/programs/${id}`);
};

export const deleteGrade = async (gradeId: string): Promise<void> => {
  await axios.delete(`/grades/${gradeId}`);
};
