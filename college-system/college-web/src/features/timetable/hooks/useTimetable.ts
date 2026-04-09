import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import {
  fetchSectionTimetable,
  fetchPeriodConfig,
  upsertPeriodConfig,
  createSlot,
  updateSlot,
  deleteSlot,
  clearSectionTimetable
} from '../api/timetable.api'
import { CreateSlotInput, UpdateSlotInput, PeriodConfigInput } from '../types/timetable.types'

export const useSectionTimetable = (sectionId: string, academicYear: string) => {
  return useQuery({
    queryKey: ['timetable', 'section', sectionId, academicYear],
    queryFn: () => fetchSectionTimetable(sectionId, academicYear),
    enabled: !!sectionId && !!academicYear,
  })
}

export const usePeriodConfig = (campusId: string, gradeId: string) => {
  return useQuery({
    queryKey: ['timetable', 'config', campusId, gradeId],
    queryFn: () => fetchPeriodConfig(campusId, gradeId),
    enabled: !!campusId && !!gradeId,
  })
}

export const useUpsertPeriodConfig = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: PeriodConfigInput) => upsertPeriodConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable', 'config'] })
      toast.success('Period configuration saved')
    },
    onError: () => { toast.error('Failed to save period configuration') }
  })
}

export const useCreateSlot = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: CreateSlotInput) => createSlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] })
      toast.success('Slot saved successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Failed to save slot')
    }
  })
}

export const useUpdateSlot = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSlotInput }) => updateSlot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] })
      toast.success('Slot updated successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Failed to update slot')
    }
  })
}

export const useDeleteSlot = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: string) => deleteSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] })
      toast.success('Slot deleted')
    },
    onError: () => { toast.error('Failed to delete slot') }
  })
}

export const useClearTimetable = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ sectionId, academicYear }: { sectionId: string; academicYear: string }) =>
      clearSectionTimetable(sectionId, academicYear),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] })
      toast.success('Timetable cleared')
    },
    onError: () => { toast.error('Failed to clear timetable') }
  })
}
