import { useQuery } from '@tanstack/react-query'
import { fetchParentDashboard } from '../api/parent-dashboard.api'

export const useParentDashboard = (studentId?: string) => {
  return useQuery({
    queryKey: ['parent-dashboard', studentId],
    queryFn: () => fetchParentDashboard(studentId),
    staleTime: 60_000,
    refetchInterval: 120_000,
  })
}
