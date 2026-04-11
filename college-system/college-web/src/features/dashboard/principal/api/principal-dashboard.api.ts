import api from '@/lib/axios'
import { PrincipalDashboardData } from '../types/principal-dashboard.types'

export async function fetchPrincipalDashboard(campusId?: string): Promise<PrincipalDashboardData> {
  const params: Record<string, string> = {}
  if (campusId) params.campusId = campusId
  const res = await api.get('/api/v1/dashboard/principal', { params })
  return res.data.data
}
