import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as staffApi from '../api/staff.api';
import { CreateStaffInput, UpdateStaffInput } from '../types/staff.types';
import { useToast } from '@/hooks/useToast';

export const useStaff = (filters?: staffApi.StaffFilters) => {
  return useQuery({
    queryKey: ['staff', filters],
    queryFn: () => staffApi.fetchAllStaff(filters),
  });
};

export const useInfiniteStaff = (filters: staffApi.StaffFilters = {}) => {
  return useInfiniteQuery({
    queryKey: ['staff', 'infinite', filters],
    queryFn: ({ pageParam }) => staffApi.fetchStaffPage(filters, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) => last.page < last.totalPages ? last.page + 1 : undefined,
  });
};

export const useStaffById = (id: string | null) => {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => id ? staffApi.fetchStaffById(id) : Promise.reject('No ID'),
    enabled: !!id,
  });
};

export const useStaffByCampus = (campusId: string) => {
  return useQuery({
    queryKey: ['staff', 'campus', campusId],
    queryFn: () => staffApi.fetchStaffByCampus(campusId),
    enabled: !!campusId,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateStaffInput) => staffApi.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      success('Staff member added successfully');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to create staff';
      error(msg);
    }
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffInput }) =>
      staffApi.updateStaff(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff', variables.id] });
      success('Staff member updated successfully');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update staff';
      error(msg);
    }
  });
};

export const useToggleStaffStatus = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => staffApi.toggleStaffStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      success('Staff status toggled successfully');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to toggle status';
      error(msg);
    }
  });
};
