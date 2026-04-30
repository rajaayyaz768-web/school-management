import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as sectionsApi from '../api/sections.api';
import { CreateSectionInput, UpdateSectionInput } from '../types/sections.types';
import { useToast } from '@/hooks/useToast';
import { extractApiError } from '@/lib/apiError';

export const useSections = (gradeId?: string, campusId?: string) => {
  return useQuery({
    queryKey: ['sections', gradeId, campusId],
    queryFn: () => sectionsApi.fetchAllSections(gradeId, campusId),
  });
};

export const useSectionStudentCount = (id: string) => {
  return useQuery({
    queryKey: ['section-count', id],
    queryFn: () => sectionsApi.fetchSectionStudentCount(id),
    enabled: !!id,
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateSectionInput) => sectionsApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      success('Section created successfully');
    },
    onError: (err: unknown) => {
      const msg = extractApiError(err, 'Failed to create section');
      error(msg);
    }
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSectionInput }) =>
      sectionsApi.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      success('Section updated successfully');
    },
    onError: (err: unknown) => {
      const msg = extractApiError(err, 'Failed to update section');
      error(msg);
    }
  });
};

export const useToggleSectionStatus = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => sectionsApi.toggleSectionStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      success('Section status toggled successfully');
    },
    onError: (err: unknown) => {
      const msg = extractApiError(err, 'Failed to toggle status');
      error(msg);
    }
  });
};

export const useProgramGrades = (programId?: string) => {
  return useQuery({
    queryKey: ['grades', programId],
    queryFn: () => programId ? sectionsApi.fetchGradesByProgramId(programId) : Promise.resolve([]),
    enabled: !!programId,
  });
};
