import api from '@/lib/axios'
import { ParentDashboardData } from '../types/parent-dashboard.types'

export async function fetchParentDashboard(studentId?: string): Promise<ParentDashboardData> {
  const params: Record<string, string> = {}
  if (studentId) params.studentId = studentId
  const res = await api.get('/dashboard/parent', { params })
  return res.data.data
}
