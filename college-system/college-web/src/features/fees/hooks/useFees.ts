import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import {
  fetchFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  fetchFeeRecords,
  fetchFeeRecordsPage,
  fetchStudentFeeRecords,
  generateFeeRecords,
  markFeeAsPaid,
  fetchFeeDefaulters,
  fetchFeeChalanData,
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

export const useInfiniteFeeRecords = (filters: FeeRecordFilters) => {
  return useInfiniteQuery({
    queryKey: ['fee-records', 'infinite', filters],
    queryFn: ({ pageParam }) => fetchFeeRecordsPage(filters.campusId, filters.status, filters.academicYear, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) => last.page < Math.ceil(last.total / last.limit) ? last.page + 1 : undefined,
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

export const useFeeChalanData = (id: string) => {
  return useQuery({
    queryKey: ['fee-chalan', id],
    queryFn: () => fetchFeeChalanData(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeeDefaulters = (campusId: string, academicYear: string) => {
  return useQuery({
    queryKey: ['fee-defaulters', campusId, academicYear],
    queryFn: () => fetchFeeDefaulters(campusId, academicYear),
    enabled: !!academicYear,
  });
};
