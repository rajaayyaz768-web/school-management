import axios from '@/lib/axios';
import {
  FeeStructureResponse,
  CreateFeeStructureInput,
  UpdateFeeStructureInput,
  FeeRecordResponse,
  MarkAsPaidInput,
  GenerateFeeRecordsInput,
  FeeDefaulter,
} from '../types/fees.types';

export const fetchFeeStructures = async (
  campusId?: string,
  academicYear?: string
): Promise<FeeStructureResponse[]> => {
  const params: Record<string, string> = {};
  if (campusId) params.campusId = campusId;
  if (academicYear) params.academicYear = academicYear;
  const res = await axios.get('/fees/structures', { params });
  return res.data.data;
};

export const createFeeStructure = async (
  data: CreateFeeStructureInput
): Promise<FeeStructureResponse> => {
  const res = await axios.post('/fees/structures', data);
  return res.data.data;
};

export const updateFeeStructure = async (
  id: string,
  data: UpdateFeeStructureInput
): Promise<FeeStructureResponse> => {
  const res = await axios.put(`/fees/structures/${id}`, data);
  return res.data.data;
};

export const fetchFeeRecords = async (
  campusId?: string,
  status?: string,
  academicYear?: string
): Promise<FeeRecordResponse[]> => {
  const params: Record<string, string> = {};
  if (campusId) params.campusId = campusId;
  if (status && status !== 'ALL') params.status = status;
  if (academicYear) params.academicYear = academicYear;
  const res = await axios.get('/fees/records', { params });
  return res.data.data;
};

export const fetchStudentFeeRecords = async (
  studentId: string
): Promise<FeeRecordResponse[]> => {
  const res = await axios.get(`/fees/records/student/${studentId}`);
  return res.data.data;
};

export const generateFeeRecords = async (
  data: GenerateFeeRecordsInput
): Promise<{ created: number }> => {
  const res = await axios.post('/fees/records/generate', data);
  return res.data.data;
};

export const markFeeAsPaid = async (
  id: string,
  data: MarkAsPaidInput
): Promise<FeeRecordResponse> => {
  const res = await axios.post(`/fees/records/${id}/mark-paid`, data);
  return res.data.data;
};

export const fetchFeeDefaulters = async (
  campusId: string,
  academicYear: string
): Promise<FeeDefaulter[]> => {
  const params: Record<string, string> = {};
  if (campusId) params.campusId = campusId;
  if (academicYear) params.academicYear = academicYear;
  const res = await axios.get('/fees/defaulters', { params });
  return res.data.data;
};
