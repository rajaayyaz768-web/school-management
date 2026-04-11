import { AnnouncementAudience } from '@prisma/client'

export interface CreateAnnouncementDto {
  title: string
  content: string
  audience: AnnouncementAudience
  campusId?: string
  sectionId?: string
  publishedAt?: string
  expiresAt?: string
}

export interface UpdateAnnouncementDto {
  title?: string
  content?: string
  audience?: AnnouncementAudience
  campusId?: string | null
  sectionId?: string | null
  publishedAt?: string | null
  expiresAt?: string | null
}

export interface AnnouncementResponse {
  id: string
  title: string
  content: string
  audience: AnnouncementAudience
  campusId: string | null
  sectionId: string | null
  authorId: string
  publishedAt: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  campus: { id: string; name: string } | null
  section: { id: string; name: string } | null
  author: { id: string; email: string }
}
