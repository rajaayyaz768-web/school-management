import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import {
  fetchExamTypes,
  createExamType,
  fetchExams,
  createExam,
  updateExam,
  deleteExam,
  fetchExamResults,
  enterBulkResults,
} from '../api/exams.api'
import {
  CreateExamInput,
  UpdateExamInput,
  BulkEnterResultsInput,
} from '../types/exams.types'

export const useExamTypes = (campusId?: string) => {
  return useQuery({
    queryKey: ['exam-types', campusId],
    queryFn: () => fetchExamTypes(campusId),
    enabled: true,
  })
}

export const useCreateExamType = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: { name: string; campusId: string }) => createExamType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-types'] })
      toast.success('Exam type created successfully')
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to create exam type'
      toast.error(msg)
    },
  })
}

interface ExamFilters {
  sectionId?: string
  subjectId?: string
  examTypeId?: string
  status?: string
}

export const useExams = (filters?: ExamFilters) => {
  return useQuery({
    queryKey: ['exams', filters],
    queryFn: () => fetchExams(filters),
    enabled: true,
  })
}

export const useExamResults = (examId: string) => {
  return useQuery({
    queryKey: ['exam-results', examId],
    queryFn: () => fetchExamResults(examId),
    enabled: !!examId,
  })
}

export const useCreateExam = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: CreateExamInput) => createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
      toast.success('Exam scheduled successfully')
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to create exam'
      toast.error(msg)
    },
  })
}

export const useUpdateExam = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExamInput }) => updateExam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
      toast.success('Exam updated successfully')
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to update exam'
      toast.error(msg)
    },
  })
}

export const useDeleteExam = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: string) => deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
      toast.success('Exam deleted')
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to delete exam'
      toast.error(msg)
    },
  })
}

export const useEnterBulkResults = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: BulkEnterResultsInput) => enterBulkResults(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results'] })
      toast.success('Results saved successfully')
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to save results'
      toast.error(msg)
    },
  })
}
