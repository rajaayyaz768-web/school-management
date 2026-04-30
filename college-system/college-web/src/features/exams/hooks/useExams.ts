import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import { extractApiError } from '@/lib/apiError'
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
      toast.error(extractApiError(error, 'Failed to create exam type'))
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
      toast.error(extractApiError(error, 'Failed to create exam'))
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
      toast.error(extractApiError(error, 'Failed to update exam'))
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
      toast.error(extractApiError(error, 'Failed to delete exam'))
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
      toast.error(extractApiError(error, 'Failed to save results'))
    },
  })
}
