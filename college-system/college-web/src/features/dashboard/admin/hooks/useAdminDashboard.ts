import { useQuery } from '@tanstack/react-query'
import { fetchAdminDashboard } from '../api/admin-dashboard.api'

export const useAdminDashboard = (campusId?: string) => {
  return useQuery({
    queryKey: ['admin-dashboard', campusId],
    queryFn: () => fetchAdminDashboard(campusId),
    staleTime: 60_000,
    refetchInterval: 120_000,
  })
}
