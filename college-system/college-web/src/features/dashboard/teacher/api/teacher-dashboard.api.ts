import api from '@/lib/axios'
import { TeacherDashboardData } from '../types/teacher-dashboard.types'

export async function fetchTeacherDashboard(): Promise<TeacherDashboardData> {
  const res = await api.get('/dashboard/teacher')
  return res.data.data
}
