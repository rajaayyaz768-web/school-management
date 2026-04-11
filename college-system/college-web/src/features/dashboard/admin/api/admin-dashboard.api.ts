import api from '@/lib/axios'
import { AdminDashboardData } from '../types/admin-dashboard.types'

export async function fetchAdminDashboard(campusId?: string): Promise<AdminDashboardData> {
  const params: Record<string, string> = {}
  if (campusId) params.campusId = campusId
  const res = await api.get('/api/v1/dashboard/admin', { params })
  return res.data.data
}
