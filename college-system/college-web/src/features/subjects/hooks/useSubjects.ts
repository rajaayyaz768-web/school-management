import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as subjectsApi from '../api/subjects.api';
import { CreateSubjectInput, UpdateSubjectInput, CreateAssignmentInput, UpdateAssignmentInput } from '../types/subjects.types';
import { useToast } from '@/hooks/useToast';

export const useSubjects = () => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.fetchAllSubjects(),
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateSubjectInput) => subjectsApi.createSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      success('Subject created successfully');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to create subject';
      error(msg);
    }
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubjectInput }) =>
      subjectsApi.updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      success('Subject updated successfully');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update subject';
      error(msg);
    }
  });
};

export const useToggleSubjectStatus = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => subjectsApi.toggleSubjectStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      success('Subject status toggled successfully');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to toggle status';
      error(msg);
    }
  });
};

// ─── ASSIGNMENTS HOOKS ───────────────────────────────────────────────────────

export const useAssignmentsBySection = (sectionId: string) => {
  return useQuery({
    queryKey: ['assignments', 'section', sectionId],
    queryFn: () => subjectsApi.fetchAssignmentsBySection(sectionId),
    enabled: !!sectionId,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateAssignmentInput) => subjectsApi.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      success('Assignment created successfully');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to create assignment';
      error(msg);
    }
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssignmentInput }) =>
      subjectsApi.updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      success('Assignment updated successfully');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update assignment';
      error(msg);
    }
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => subjectsApi.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      success('Assignment deleted successfully');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to delete assignment';
      error(msg);
    }
  });
};
