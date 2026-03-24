import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as assignmentApi from '../api/section-assignment.api';
import { ConfirmAssignmentInput } from '../types/section-assignment.types';
import { useToast } from '@/hooks/useToast';

export const useAssignmentData = (gradeId: string) => {
  return useQuery({
    queryKey: ['assignment-data', gradeId],
    queryFn: () => assignmentApi.fetchAssignmentData(gradeId),
    enabled: !!gradeId,
  });
};

export const useAutoAssign = () => {
  return useMutation({
    mutationFn: ({ gradeId, sectionCapacities }: { gradeId: string; sectionCapacities: { sectionId: string; capacity: number }[] }) =>
      assignmentApi.autoAssign(gradeId, sectionCapacities),
    // No invalidation needed — this returns a preview only conceptually bypassing persistence states entirely
  });
};

export const useConfirmAssignment = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: ConfirmAssignmentInput) => assignmentApi.confirmAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-data'] });
      success('Students assigned successfully');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to confirm assignments';
      error(msg);
    }
  });
};
