export type AnnouncementAudience = 'ALL' | 'STUDENTS' | 'PARENTS' | 'TEACHERS' | 'SECTION'

export interface Announcement {
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

export interface CreateAnnouncementInput {
  title: string
  content: string
  audience: AnnouncementAudience
  campusId?: string
  sectionId?: string
  publishedAt?: string
  expiresAt?: string
}

export interface UpdateAnnouncementInput {
  title?: string
  content?: string
  audience?: AnnouncementAudience
  campusId?: string | null
  sectionId?: string | null
  publishedAt?: string | null
  expiresAt?: string | null
}
