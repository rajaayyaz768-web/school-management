import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '../api/adminManagement.api';
import {
  CreateAdminInput,
  CreateNetworkInput,
  DeviceRequestStatus,
  ReviewDeviceRequestInput,
  UpdateDeviceInput,
  UpdateNetworkInput,
} from '../types/adminManagement.types';
import { useToast } from '@/hooks/useToast';
import { extractApiError } from '@/lib/apiError';

export const useAdmins = () => {
  return useQuery({
    queryKey: ['admins'],
    queryFn: adminApi.fetchAdmins,
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateAdminInput) => adminApi.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      success('Admin account created successfully');
    },
    onError: (err: unknown) => error(extractApiError(err, 'Failed to create admin')),
  });
};

// ── Device Registration Requests ─────────────────────────────────────────────

export const useDeviceRequests = (status?: DeviceRequestStatus) => {
  return useQuery({
    queryKey: ['device-requests', status],
    queryFn: () => adminApi.fetchDeviceRequests(status),
  });
};

export const useUnreadDeviceRequestCount = () => {
  return useQuery({
    queryKey: ['device-requests', 'unread'],
    queryFn: adminApi.fetchUnreadDeviceRequestCount,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
};

export const useReviewDeviceRequest = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: ReviewDeviceRequestInput }) =>
      adminApi.reviewDeviceRequestApi(requestId, data),
    onSuccess: (_result, vars) => {
      queryClient.invalidateQueries({ queryKey: ['device-requests'] });
      success(`Device ${vars.data.action === 'APPROVE' ? 'approved' : 'rejected'}`);
    },
    onError: (err: unknown) => error(extractApiError(err, 'Failed to review device request')),
  });
};

export const useMarkDeviceRequestsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.markDeviceRequestsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-requests', 'unread'] });
    },
  });
};

// ── Registered Devices ───────────────────────────────────────────────────────

export const useAdminDevices = (adminId: string) => {
  return useQuery({
    queryKey: ['admin-devices', adminId],
    queryFn: () => adminApi.fetchAdminDevices(adminId),
    enabled: !!adminId,
  });
};

export const useUpdateDevice = (adminId: string) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ deviceId, data }: { deviceId: string; data: UpdateDeviceInput }) =>
      adminApi.updateDeviceApi(deviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-devices', adminId] });
      success('Device updated');
    },
    onError: (err: unknown) => error(extractApiError(err, 'Failed to update device')),
  });
};

export const useDeleteDevice = (adminId: string) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (deviceId: string) => adminApi.deleteDeviceApi(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-devices', adminId] });
      success('Device removed');
    },
    onError: (err: unknown) => error(extractApiError(err, 'Failed to remove device')),
  });
};

// ── Campus Allowed Networks ───────────────────────────────────────────────────

export const useAllowedNetworks = (campusId: string) => {
  return useQuery({
    queryKey: ['allowed-networks', campusId],
    queryFn: () => adminApi.fetchAllowedNetworks(campusId),
    enabled: !!campusId,
  });
};

export const useCreateAllowedNetwork = (campusId: string) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateNetworkInput) => adminApi.createAllowedNetworkApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-networks', campusId] });
      success('Network rule added');
    },
    onError: (err: unknown) => error(extractApiError(err, 'Failed to add network rule')),
  });
};

export const useUpdateAllowedNetwork = (campusId: string) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ networkId, data }: { networkId: string; data: UpdateNetworkInput }) =>
      adminApi.updateAllowedNetworkApi(networkId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-networks', campusId] });
      success('Network rule updated');
    },
    onError: (err: unknown) => error(extractApiError(err, 'Failed to update network rule')),
  });
};

export const useDeleteAllowedNetwork = (campusId: string) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (networkId: string) => adminApi.deleteAllowedNetworkApi(networkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-networks', campusId] });
      success('Network rule removed');
    },
    onError: (err: unknown) => error(extractApiError(err, 'Failed to remove network rule')),
  });
};
