import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/system.api'

export function useGoogleStatus() {
  return useQuery({
    queryKey: ['system', 'google-status'],
    queryFn: api.getGoogleStatus,
    staleTime: 30_000,
    refetchInterval: 30_000, // poll for status changes
  })
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (email: string) => api.sendOtp(email),
  })
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => api.verifyOtp(email, otp),
  })
}

export function useDisconnectGoogle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.disconnectGoogle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system', 'google-status'] })
      queryClient.invalidateQueries({ queryKey: ['system', 'backups'] })
    },
  })
}

export function useBackupList() {
  return useQuery({
    queryKey: ['system', 'backups'],
    queryFn: api.listBackups,
    staleTime: 30_000,
  })
}

export function useTriggerBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.triggerBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system', 'backups'] })
      queryClient.invalidateQueries({ queryKey: ['system', 'google-status'] })
    },
  })
}

export function useDeleteBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (fileId: string) => api.deleteBackup(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system', 'backups'] })
      queryClient.invalidateQueries({ queryKey: ['system', 'google-status'] })
    },
  })
}

export function useRestoreBackup() {
  return useMutation({
    mutationFn: (fileId: string) => api.restoreBackup(fileId),
  })
}
