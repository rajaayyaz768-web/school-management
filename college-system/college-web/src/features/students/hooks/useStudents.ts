import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as studentsApi from '../api/students.api';
import { CreateStudentInput, UpdateStudentInput } from '../types/students.types';
import { useToast } from '@/hooks/useToast';

export const useStudents = (filters?: studentsApi.StudentFilters) => {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentsApi.fetchAllStudents(filters),
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
      const msg = err instanceof Error ? err.message : 'Failed to create student';
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
      const msg = err instanceof Error ? err.message : 'Failed to update student';
      error(msg);
    }
  });
};
