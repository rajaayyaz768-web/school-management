import axios from '@/lib/axios';
import {
  Admin,
  AllowedNetwork,
  CreateAdminInput,
  CreateNetworkInput,
  DeviceRequest,
  DeviceRequestStatus,
  RegisteredDevice,
  ReviewDeviceRequestInput,
  UpdateDeviceInput,
  UpdateNetworkInput,
} from '../types/adminManagement.types';

export const fetchAdmins = async (): Promise<Admin[]> => {
  const response = await axios.get('/admin-management');
  return response.data.data;
};

export const createAdmin = async (data: CreateAdminInput): Promise<Admin> => {
  const response = await axios.post('/admin-management', data);
  return response.data.data;
};

// ── Device Registration Requests ─────────────────────────────────────────────

export const fetchDeviceRequests = async (status?: DeviceRequestStatus): Promise<DeviceRequest[]> => {
  const response = await axios.get('/admin-management/device-requests', {
    params: status ? { status } : undefined,
  });
  return response.data.data;
};

export const fetchUnreadDeviceRequestCount = async (): Promise<number> => {
  const response = await axios.get('/admin-management/device-requests/unread-count');
  return response.data.data.count;
};

export const reviewDeviceRequestApi = async (
  requestId: string,
  data: ReviewDeviceRequestInput
): Promise<void> => {
  await axios.patch(`/admin-management/device-requests/${requestId}/review`, data);
};

export const markDeviceRequestsReadApi = async (): Promise<void> => {
  await axios.post('/admin-management/device-requests/mark-read');
};

// ── Registered Devices ───────────────────────────────────────────────────────

export const fetchAdminDevices = async (adminId: string): Promise<RegisteredDevice[]> => {
  const response = await axios.get(`/admin-management/admins/${adminId}/devices`);
  return response.data.data;
};

export const updateDeviceApi = async (
  deviceId: string,
  data: UpdateDeviceInput
): Promise<RegisteredDevice> => {
  const response = await axios.patch(`/admin-management/devices/${deviceId}`, data);
  return response.data.data;
};

export const deleteDeviceApi = async (deviceId: string): Promise<void> => {
  await axios.delete(`/admin-management/devices/${deviceId}`);
};

// ── Campus Allowed Networks ───────────────────────────────────────────────────

export const fetchAllowedNetworks = async (campusId: string): Promise<AllowedNetwork[]> => {
  const response = await axios.get('/admin-management/networks', { params: { campusId } });
  return response.data.data;
};

export const createAllowedNetworkApi = async (data: CreateNetworkInput): Promise<AllowedNetwork> => {
  const response = await axios.post('/admin-management/networks', data);
  return response.data.data;
};

export const updateAllowedNetworkApi = async (
  networkId: string,
  data: UpdateNetworkInput
): Promise<AllowedNetwork> => {
  const response = await axios.patch(`/admin-management/networks/${networkId}`, data);
  return response.data.data;
};

export const deleteAllowedNetworkApi = async (networkId: string): Promise<void> => {
  await axios.delete(`/admin-management/networks/${networkId}`);
};
