import axios from '@/lib/axios';
import {
  Subject,
  SectionSubjectTeacher,
  CreateSubjectInput,
  UpdateSubjectInput,
  CreateAssignmentInput,
  UpdateAssignmentInput
} from '../types/subjects.types';

export const fetchAllSubjects = async (): Promise<Subject[]> => {
  const response = await axios.get('/subjects');
  return response.data.data;
};

export const fetchSubjectById = async (id: string): Promise<Subject> => {
  const response = await axios.get(`/subjects/${id}`);
  return response.data.data;
};

export const createSubject = async (data: CreateSubjectInput): Promise<Subject> => {
  const payload = {
    name: data.name,
    code: data.code,
    type: data.type,
    creditHours: data.creditHours,
  };
  const response = await axios.post('/subjects', payload);
  return response.data.data;
};

export const updateSubject = async (id: string, data: UpdateSubjectInput): Promise<Subject> => {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.code !== undefined) payload.code = data.code;
  if (data.type !== undefined) payload.type = data.type;
  if (data.creditHours !== undefined) payload.creditHours = data.creditHours;

  const response = await axios.put(`/subjects/${id}`, payload);
  return response.data.data;
};

export const toggleSubjectStatus = async (id: string): Promise<Subject> => {
  const response = await axios.patch(`/subjects/${id}/toggle`);
  return response.data.data;
};

// ─── ASSIGNMENTS ─────────────────────────────────────────────────────────────

export const fetchAssignmentsBySection = async (sectionId: string): Promise<SectionSubjectTeacher[]> => {
  const response = await axios.get(`/subjects/assignments?section_id=${sectionId}`);
  return response.data.data;
};

export const fetchAssignmentsByTeacher = async (staffId: string): Promise<SectionSubjectTeacher[]> => {
  const response = await axios.get(`/subjects/assignments?teacher_id=${staffId}`);
  return response.data.data;
};

export const createAssignment = async (data: CreateAssignmentInput): Promise<SectionSubjectTeacher> => {
  const response = await axios.post('/subjects/assignments', data);
  return response.data.data;
};

export const updateAssignment = async (id: string, data: UpdateAssignmentInput): Promise<SectionSubjectTeacher> => {
  const response = await axios.put(`/subjects/assignments/${id}`, data);
  return response.data.data;
};

export const deleteAssignment = async (id: string): Promise<void> => {
  await axios.delete(`/subjects/assignments/${id}`);
};
