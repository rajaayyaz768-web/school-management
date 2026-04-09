import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import {
  fetchFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  fetchFeeRecords,
  fetchStudentFeeRecords,
  generateFeeRecords,
  markFeeAsPaid,
  fetchFeeDefaulters,
} from '../api/fees.api';
import {
  CreateFeeStructureInput,
  UpdateFeeStructureInput,
  GenerateFeeRecordsInput,
  MarkAsPaidInput,
} from '../types/fees.types';

export const useFeeStructures = (campusId?: string, academicYear?: string) => {
  return useQuery({
    queryKey: ['fee-structures', campusId, academicYear],
    queryFn: () => fetchFeeStructures(campusId, academicYear),
    enabled: true,
  });
};

export const useCreateFeeStructure = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CreateFeeStructureInput) => createFeeStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      toast.success('Fee structure created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create fee structure');
    },
  });
};

export const useUpdateFeeStructure = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeeStructureInput }) =>
      updateFeeStructure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      toast.success('Fee structure updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update fee structure');
    },
  });
};

interface FeeRecordFilters {
  campusId?: string;
  status?: string;
  academicYear?: string;
}

export const useFeeRecords = (filters: FeeRecordFilters) => {
  return useQuery({
    queryKey: ['fee-records', filters],
    queryFn: () => fetchFeeRecords(filters.campusId, filters.status, filters.academicYear),
    enabled: true,
  });
};

export const useStudentFeeRecords = (studentId: string) => {
  return useQuery({
    queryKey: ['fee-records', 'student', studentId],
    queryFn: () => fetchStudentFeeRecords(studentId),
    enabled: !!studentId,
  });
};

export const useGenerateFeeRecords = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: GenerateFeeRecordsInput) => generateFeeRecords(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-records'] });
      toast.success('Fee records generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate fee records');
    },
  });
};

export const useMarkFeeAsPaid = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarkAsPaidInput }) =>
      markFeeAsPaid(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-records'] });
      queryClient.invalidateQueries({ queryKey: ['fee-defaulters'] });
      toast.success('Fee marked as paid successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark fee as paid');
    },
  });
};

export const useFeeDefaulters = (campusId: string, academicYear: string) => {
  return useQuery({
    queryKey: ['fee-defaulters', campusId, academicYear],
    queryFn: () => fetchFeeDefaulters(campusId, academicYear),
    enabled: !!academicYear,
  });
};
