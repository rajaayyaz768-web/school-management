import { useQuery } from '@tanstack/react-query'
import { fetchPrincipalDashboard } from '../api/principal-dashboard.api'

export const usePrincipalDashboard = (campusId?: string) => {
  return useQuery({
    queryKey: ['principal-dashboard', campusId],
    queryFn: () => fetchPrincipalDashboard(campusId),
    staleTime: 60_000, // 1 minute
    refetchInterval: 120_000, // auto-refresh every 2 minutes
  })
}
