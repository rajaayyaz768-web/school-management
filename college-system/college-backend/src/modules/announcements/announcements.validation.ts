import { z } from 'zod'
import { AnnouncementAudience } from '@prisma/client'

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  audience: z.nativeEnum(AnnouncementAudience),
  campusId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  publishedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
})

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  audience: z.nativeEnum(AnnouncementAudience).optional(),
  campusId: z.string().uuid().nullable().optional(),
  sectionId: z.string().uuid().nullable().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
})
