import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as programsApi from '../api/programs.api';
import { CreateProgramInput, UpdateProgramInput } from '../types/programs.types';
import { useToast } from '@/hooks/useToast';

export const usePrograms = (campusId?: string) => {
  return useQuery({
    queryKey: ['programs', campusId],
    queryFn: () => programsApi.fetchAllPrograms(campusId),
  });
};

export const useCreateProgram = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateProgramInput) => programsApi.createProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      success('Program created successfully');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to create program';
      error(msg);
    }
  });
};

export const useUpdateProgram = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProgramInput }) =>
      programsApi.updateProgram(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      success('Program updated successfully');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update program';
      error(msg);
    }
  });
};

export const useToggleProgramStatus = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => programsApi.toggleProgramStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      success('Program status toggled successfully');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to toggle status';
      error(msg);
    }
  });
};
