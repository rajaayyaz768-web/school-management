import { useQuery } from '@tanstack/react-query'
import { fetchStudentDashboard } from '../api/student-dashboard.api'

export const useStudentDashboard = () => {
  return useQuery({
    queryKey: ['student-dashboard'],
    queryFn: fetchStudentDashboard,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })
}
