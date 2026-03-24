import axios from '@/lib/axios';
import { Campus, CreateCampusInput, UpdateCampusInput } from '../types/campus.types';

export const fetchAllCampuses = async (): Promise<Campus[]> => {
  const response = await axios.get('/campus');
  return response.data.data;
};

export const fetchCampusById = async (id: string): Promise<Campus> => {
  const response = await axios.get(`/campus/${id}`);
  return response.data.data;
};

export const createCampus = async (data: CreateCampusInput): Promise<Campus> => {
  const response = await axios.post('/campus', data);
  return response.data.data;
};

export const updateCampus = async (id: string, data: UpdateCampusInput): Promise<Campus> => {
  const response = await axios.put(`/campus/${id}`, data);
  return response.data.data;
};

export const toggleCampusStatus = async (id: string): Promise<Campus> => {
  const response = await axios.patch(`/campus/${id}/toggle`);
  return response.data.data;
};
