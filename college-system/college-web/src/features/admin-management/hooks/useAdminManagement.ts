import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '../api/adminManagement.api';
import { CreateAdminInput } from '../types/adminManagement.types';
import { useToast } from '@/hooks/useToast';

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
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to create admin';
      error(msg);
    },
  });
};
