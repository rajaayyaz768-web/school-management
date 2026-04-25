import axios from '@/lib/axios';
import { Admin, CreateAdminInput } from '../types/adminManagement.types';

export const fetchAdmins = async (): Promise<Admin[]> => {
  const response = await axios.get('/admin-management');
  return response.data.data;
};

export const createAdmin = async (data: CreateAdminInput): Promise<Admin> => {
  const response = await axios.post('/admin-management', data);
  return response.data.data;
};
