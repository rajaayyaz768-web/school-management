import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listBackups, getBackupStatus, triggerBackup } from '../api/system.api'

export function useBackupList() {
  return useQuery({
    queryKey: ['system', 'backups'],
    queryFn: listBackups,
    staleTime: 30_000,
  })
}

export function useBackupStatus() {
  return useQuery({
    queryKey: ['system', 'backup-status'],
    queryFn: getBackupStatus,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

export function useTriggerBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: triggerBackup,
    onSuccess: () => {
      // Refresh the list and status after a manual backup
      queryClient.invalidateQueries({ queryKey: ['system', 'backups'] })
      queryClient.invalidateQueries({ queryKey: ['system', 'backup-status'] })
    },
  })
}
