import axios from '@/lib/axios';
import { Section, CreateSectionInput, UpdateSectionInput, GradeFilterItem } from '../types/sections.types';

export const fetchAllSections = async (gradeId?: string, campusId?: string): Promise<Section[]> => {
  const params: Record<string, string> = {}
  if (gradeId) params.grade_id = gradeId
  if (campusId) params.campus_id = campusId
  const response = await axios.get('/sections', { params });
  return response.data.data;
};

export const fetchSectionById = async (id: string): Promise<Section> => {
  const response = await axios.get(`/sections/${id}`);
  return response.data.data;
};

export const fetchSectionStudentCount = async (id: string): Promise<{ section_id: string; student_count: number }> => {
  const response = await axios.get(`/sections/${id}/student-count`);
  return response.data.data;
};

export const createSection = async (data: CreateSectionInput): Promise<Section> => {
  const payload = {
    gradeId: data.gradeId,
    name: data.name,
    roomNumber: data.roomNumber,
    capacity: data.capacity,
  };
  const response = await axios.post('/sections', payload);
  return response.data.data;
};

export const updateSection = async (id: string, data: UpdateSectionInput): Promise<Section> => {
  const payload: Record<string, unknown> = {};
  if (data.gradeId !== undefined) payload.gradeId = data.gradeId;
  if (data.name !== undefined) payload.name = data.name;
  if (data.roomNumber !== undefined) payload.roomNumber = data.roomNumber;
  if (data.capacity !== undefined) payload.capacity = data.capacity;

  const response = await axios.put(`/sections/${id}`, payload);
  return response.data.data;
};

export const toggleSectionStatus = async (id: string): Promise<Section> => {
  const response = await axios.patch(`/sections/${id}/toggle`);
  return response.data.data;
};

// Supporting Grades API since it is needed strictly for sections filtering
export const fetchGradesByProgramId = async (programId: string): Promise<GradeFilterItem[]> => {
  const response = await axios.get(`/grades?program_id=${programId}`);
  return response.data.data;
};
