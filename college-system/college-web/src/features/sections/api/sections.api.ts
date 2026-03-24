import axios from '@/lib/axios';
import { Section, CreateSectionInput, UpdateSectionInput, GradeFilterItem } from '../types/sections.types';

export const fetchAllSections = async (gradeId?: string): Promise<Section[]> => {
  const url = gradeId ? `/sections?grade_id=${gradeId}` : '/sections';
  const response = await axios.get(url);
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
  // Mapping frontend gradeId to backend grade_id recursively based on payload requirements
  const payload = {
    grade_id: data.gradeId,
    name: data.name,
    room_number: data.roomNumber,
    max_students: data.capacity,
  };
  const response = await axios.post('/sections', payload);
  return response.data.data;
};

export const updateSection = async (id: string, data: UpdateSectionInput): Promise<Section> => {
  const payload: Record<string, unknown> = {};
  if (data.gradeId !== undefined) payload.grade_id = data.gradeId;
  if (data.name !== undefined) payload.name = data.name;
  if (data.roomNumber !== undefined) payload.room_number = data.roomNumber;
  if (data.capacity !== undefined) payload.max_students = data.capacity;

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
