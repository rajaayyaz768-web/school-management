import axios from '@/lib/axios';
import { Staff, CreateStaffInput, UpdateStaffInput } from '../types/staff.types';

export interface StaffFilters {
  campusId?: string;
  employmentType?: string;
  isActive?: boolean | string;
}

export const fetchAllStaff = async (filters?: StaffFilters): Promise<Staff[]> => {
  const params = new URLSearchParams();
  if (filters?.campusId) params.append('campus_id', filters.campusId);
  if (filters?.employmentType && filters.employmentType !== 'ALL') params.append('employment_type', filters.employmentType);
  if (filters?.isActive !== undefined && filters.isActive !== 'ALL') params.append('is_active', String(filters.isActive));

  const url = `/staff${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await axios.get(url);
  return response.data.data;
};

export const fetchStaffById = async (id: string): Promise<Staff> => {
  const response = await axios.get(`/staff/${id}`);
  return response.data.data;
};

export const fetchStaffByCampus = async (campusId: string): Promise<Staff[]> => {
  const response = await axios.get(`/staff/by-campus/${campusId}`);
  return response.data.data;
};

export const createStaff = async (data: CreateStaffInput): Promise<{ staff: Staff; temporaryPassword: string }> => {
  const response = await axios.post('/staff', data);
  return response.data.data;
};

export const updateStaff = async (id: string, data: UpdateStaffInput): Promise<Staff> => {
  const response = await axios.put(`/staff/${id}`, data);
  return response.data.data;
};

export const toggleStaffStatus = async (id: string): Promise<Staff> => {
  const response = await axios.patch(`/staff/${id}/toggle`);
  return response.data.data;
};
