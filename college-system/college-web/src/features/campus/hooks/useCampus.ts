import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as campusApi from '../api/campus.api';
import { CreateCampusInput, UpdateCampusInput } from '../types/campus.types';
import { useToast } from '@/hooks/useToast';
import { extractApiError } from '@/lib/apiError';

export const useCampuses = () => {
  return useQuery({
    queryKey: ['campuses'],
    queryFn: campusApi.fetchAllCampuses,
  });
};

export const useCreateCampus = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateCampusInput) => campusApi.createCampus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      success('Campus created successfully');
    },
    onError: (err: unknown) => {
      const msg = extractApiError(err, 'Failed to create campus');
      error(msg);
    }
  });
};

export const useUpdateCampus = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampusInput }) =>
      campusApi.updateCampus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      success('Campus updated successfully');
    },
    onError: (err: unknown) => {
      const msg = extractApiError(err, 'Failed to update campus');
      error(msg);
    }
  });
};

export const useToggleCampusStatus = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => campusApi.toggleCampusStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      success('Campus status toggled successfully');
    },
    onError: (err: unknown) => {
      const msg = extractApiError(err, 'Failed to toggle status');
      error(msg);
    }
  });
};
