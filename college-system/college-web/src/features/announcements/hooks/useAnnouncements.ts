import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import {
  fetchAnnouncements,
  fetchAnnouncementsForMe,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  AnnouncementFilters,
} from '../api/announcements.api'
import { CreateAnnouncementInput, UpdateAnnouncementInput } from '../types/announcements.types'

export const useAnnouncements = (filters?: AnnouncementFilters) => {
  return useQuery({
    queryKey: ['announcements', filters],
    queryFn: () => fetchAnnouncements(filters),
    enabled: true,
  })
}

export const useAnnouncementsForMe = () => {
  return useQuery({
    queryKey: ['announcements', 'for-me'],
    queryFn: fetchAnnouncementsForMe,
    enabled: true,
  })
}

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: CreateAnnouncementInput) => createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Announcement posted')
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to post announcement'
      toast.error(msg)
    },
  })
}

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementInput }) =>
      updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Announcement updated')
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to update announcement'
      toast.error(msg)
    },
  })
}

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Announcement deleted')
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to delete announcement'
      toast.error(msg)
    },
  })
}
