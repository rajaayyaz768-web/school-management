import { useQuery } from '@tanstack/react-query'
import { fetchTeacherDashboard } from '../api/teacher-dashboard.api'

export const useTeacherDashboard = () => {
  return useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: fetchTeacherDashboard,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })
}
