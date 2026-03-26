import axios from '@/lib/axios';
import {
  AssignmentData,
  AssignmentPreview,
  ConfirmAssignmentInput,
  AssignmentResult,
  SectionInfo,
} from '../types/section-assignment.types';

export const fetchAssignmentData = async (gradeId: string): Promise<AssignmentData> => {
  const response = await axios.get<{ success: boolean; data: AssignmentData }>(
    `/section-assignment/data?grade_id=${gradeId}`
  );
  return response.data.data;
};

export const autoAssign = async (
  gradeId: string,
  sectionCapacities: { sectionId: string; capacity: number }[]
): Promise<AssignmentPreview[]> => {
  const response = await axios.post<{ success: boolean; data: AssignmentPreview[] }>(
    `/section-assignment/auto-assign`,
    { grade_id: gradeId, sectionCapacities }
  );
  return response.data.data;
};

export const confirmAssignment = async (data: ConfirmAssignmentInput): Promise<AssignmentResult> => {
  const response = await axios.post<{ success: boolean; data: AssignmentResult }>(
    `/section-assignment/confirm`,
    data
  );
  return response.data.data;
};

export const fetchSectionStatus = async (gradeId: string): Promise<SectionInfo[]> => {
  const response = await axios.get<{ success: boolean; data: SectionInfo[] }>(
    `/section-assignment/section-status?grade_id=${gradeId}`
  );
  return response.data.data;
};
