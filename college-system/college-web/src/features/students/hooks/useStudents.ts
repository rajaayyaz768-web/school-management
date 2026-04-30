import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as studentsApi from '../api/students.api';
import { fetchAssignmentData } from '@/features/section-assignment/api/section-assignment.api';
import { CreateStudentInput, UpdateStudentInput } from '../types/students.types';
import { useToast } from '@/hooks/useToast';
import { extractApiError } from '@/lib/apiError';

export const useStudents = (filters?: studentsApi.StudentFilters) => {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentsApi.fetchAllStudents(filters),
  });
};

export const useInfiniteStudents = (filters: Omit<studentsApi.StudentFilters, 'page' | 'limit'> = {}) => {
  return useInfiniteQuery({
    queryKey: ['students', 'infinite', filters],
    queryFn: ({ pageParam }) => studentsApi.fetchAllStudents({ ...filters, page: pageParam as number, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) => last.page < last.totalPages ? last.page + 1 : undefined,
  });
};

export const useStudentById = (id: string | null) => {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => id ? studentsApi.fetchStudentById(id) : Promise.reject('No ID'),
    enabled: !!id,
  });
};

export const useUnassignedStudents = (gradeId: string) => {
  return useQuery({
    queryKey: ['students', 'unassigned', gradeId],
    queryFn: () => studentsApi.fetchUnassignedStudents(gradeId),
    enabled: !!gradeId,
  });
};

export const useMyProfile = () => {
  return useQuery({
    queryKey: ['student-me'],
    queryFn: () => studentsApi.fetchMyProfile(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useStudentsBySection = (sectionId: string) => {
  return useQuery({
    queryKey: ['students', 'section', sectionId],
    queryFn: () => studentsApi.fetchStudentsBySection(sectionId),
    enabled: !!sectionId,
  });
};

export const useSectionsByGrade = (gradeId?: string) =>
  useQuery({
    queryKey: ['sections-by-grade', gradeId],
    queryFn: () => fetchAssignmentData(gradeId!).then(d => d.sections),
    enabled: !!gradeId,
  });

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateStudentInput) => studentsApi.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      success('Student enrolled successfully');
    },
    onError: (err: unknown) => {
      const msg = extractApiError(err, 'Failed to create student');
      error(msg);
    }
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentInput }) =>
      studentsApi.updateStudent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students', variables.id] });
      success('Student updated successfully');
    },
    onError: (err: unknown) => {
      const msg = extractApiError(err, 'Failed to update student');
      error(msg);
    }
  });
};
