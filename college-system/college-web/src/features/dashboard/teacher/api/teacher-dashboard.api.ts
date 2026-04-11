import api from '@/lib/axios'
import { TeacherDashboardData } from '../types/teacher-dashboard.types'

export async function fetchTeacherDashboard(): Promise<TeacherDashboardData> {
  const res = await api.get('/api/v1/dashboard/teacher')
  return res.data.data
}
