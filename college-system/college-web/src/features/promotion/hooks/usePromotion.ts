import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/promotion.api';
import { RunAnnualInput, RunTransitionalInput } from '../types/promotion.types';
import { useToast } from '@/hooks/useToast';

export const usePromotionStatus = () =>
  useQuery({ queryKey: ['promotion', 'status'], queryFn: api.fetchPromotionStatus });

export const useAcademicYears = () =>
  useQuery({ queryKey: ['promotion', 'years'], queryFn: api.fetchAcademicYears });

export const usePromotionHistory = () =>
  useQuery({ queryKey: ['promotion', 'history'], queryFn: api.fetchPromotionHistory });

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (name: string) => api.createAcademicYear(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion', 'years'] });
      success('Academic year created and activated');
    },
    onError: (err: unknown) => error(err instanceof Error ? err.message : 'Failed to create academic year'),
  });
};

export const useRunTransitional = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (data: RunTransitionalInput) => api.runTransitional(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['promotion', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      success(`Transitional promotion done — ${result.promoted} promoted, ${result.detained} detained, ${result.withdrawn} withdrawn`);
    },
    onError: (err: unknown) => error(err instanceof Error ? err.message : 'Promotion failed'),
  });
};

export const useRunAnnual = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (data: RunAnnualInput) => api.runAnnual(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['promotion', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      success(`Annual promotion done — ${result.graduated} graduated, ${result.promoted} promoted, ${result.detained} detained, ${result.withdrawn} withdrawn`);
    },
    onError: (err: unknown) => error(err instanceof Error ? err.message : 'Promotion failed'),
  });
};
