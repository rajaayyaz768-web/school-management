import axios from '@/lib/axios'
import {
  Announcement,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from '../types/announcements.types'

export interface AnnouncementFilters {
  campusId?: string
  audience?: string
  isActive?: boolean
}

export interface AnnouncementPage {
  data: Announcement[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const fetchAnnouncements = async (
  filters?: AnnouncementFilters
): Promise<Announcement[]> => {
  const params: Record<string, string> = {}
  if (filters?.campusId) params.campusId = filters.campusId
  if (filters?.audience) params.audience = filters.audience
  if (filters?.isActive !== undefined) params.isActive = String(filters.isActive)
  const res = await axios.get('/announcements', { params })
  const data = res.data.data
  return Array.isArray(data) ? data : (data.data ?? [])
}

export const fetchAnnouncementsPage = async (
  filters: AnnouncementFilters | undefined,
  page: number
): Promise<AnnouncementPage> => {
  const params: Record<string, string> = { page: String(page), limit: '20' }
  if (filters?.campusId) params.campusId = filters.campusId
  if (filters?.audience) params.audience = filters.audience
  if (filters?.isActive !== undefined) params.isActive = String(filters.isActive)
  const res = await axios.get('/announcements', { params })
  return res.data.data
}

export const fetchAnnouncementsForMe = async (): Promise<Announcement[]> => {
  const res = await axios.get('/announcements/feed')
  return res.data.data
}

export const fetchAnnouncementById = async (id: string): Promise<Announcement> => {
  const res = await axios.get(`/announcements/${id}`)
  return res.data.data
}

export const createAnnouncement = async (
  data: CreateAnnouncementInput
): Promise<Announcement> => {
  const res = await axios.post('/announcements', data)
  return res.data.data
}

export const updateAnnouncement = async (
  id: string,
  data: UpdateAnnouncementInput
): Promise<Announcement> => {
  const res = await axios.put(`/announcements/${id}`, data)
  return res.data.data
}

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await axios.delete(`/announcements/${id}`)
}
