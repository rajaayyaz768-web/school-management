import axios from '@/lib/axios';
import { Program, CreateProgramInput, UpdateProgramInput } from '../types/programs.types';

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
