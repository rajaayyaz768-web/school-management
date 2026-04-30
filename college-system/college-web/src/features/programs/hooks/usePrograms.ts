import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as programsApi from '../api/programs.api';
import { CreateProgramInput, UpdateProgramInput } from '../types/programs.types';
import { UpdateGradeInput } from '../api/programs.api';
import { useToast } from '@/hooks/useToast';
import { extractApiError } from '@/lib/apiError';

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
      const msg = extractApiError(err, 'Failed to create program');
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
      const e = err as { response?: { data?: { message?: string } } } & Error;
      const msg = e.response?.data?.message || e.message || 'Failed to update program';
      error(msg);
    }
  });
};

export const useUpdateGrade = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ gradeId, data }: { gradeId: string; data: UpdateGradeInput }) =>
      programsApi.updateGrade(gradeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      success('Grade updated successfully');
    },
    onError: (err: unknown) => {
      const msg = extractApiError(err, 'Failed to update grade');
      error(msg);
    },
  });
};

export const useCreateGrade = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: { programId: string; name: string; displayOrder?: number }) =>
      programsApi.createGrade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      success('Class added successfully');
    },
    onError: (err: unknown) => error(extractApiError(err, 'Failed to add class')),
  });
};

export const useSubjectsByGrade = (gradeId: string) => {
  return useQuery({
    queryKey: ['grade-subjects', gradeId],
    queryFn: () => programsApi.fetchSubjectsByGrade(gradeId),
    enabled: !!gradeId,
  });
};

export const useAddSubjectToGrade = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ gradeId, subjectId }: { gradeId: string; subjectId: string }) =>
      programsApi.addSubjectToGrade(gradeId, subjectId),
    onSuccess: (_data, { gradeId }) => {
      queryClient.invalidateQueries({ queryKey: ['grade-subjects', gradeId] });
      success('Subject added to grade');
    },
    onError: (err: unknown) => error(extractApiError(err, 'Failed to add subject')),
  });
};

export const useRemoveSubjectFromGrade = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ gradeId, subjectId }: { gradeId: string; subjectId: string }) =>
      programsApi.removeSubjectFromGrade(gradeId, subjectId),
    onSuccess: (_data, { gradeId }) => {
      queryClient.invalidateQueries({ queryKey: ['grade-subjects', gradeId] });
      success('Subject removed from grade');
    },
    onError: (err: unknown) => error(extractApiError(err, 'Failed to remove subject')),
  });
};

export const useDeleteProgram = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (id: string) => programsApi.deleteProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      success('Program deleted');
    },
    onError: (err: unknown) => error(extractApiError(err, 'Failed to delete program')),
  });
};

export const useDeleteGrade = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (gradeId: string) => programsApi.deleteGrade(gradeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      success('Class removed');
    },
    onError: (err: unknown) => error(extractApiError(err, 'Failed to remove class')),
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
      const msg = extractApiError(err, 'Failed to toggle status');
      error(msg);
    }
  });
};
