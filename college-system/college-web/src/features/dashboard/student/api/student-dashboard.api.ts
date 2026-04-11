import api from '@/lib/axios'
import { StudentDashboardData } from '../types/student-dashboard.types'

export async function fetchStudentDashboard(): Promise<StudentDashboardData> {
  const res = await api.get('/api/v1/dashboard/student')
  return res.data.data
}
