import { PrismaClient, AnnouncementAudience } from '@prisma/client'
import { CreateAnnouncementDto, UpdateAnnouncementDto, AnnouncementResponse } from './announcements.types'

const prisma = new PrismaClient()

const announcementInclude = {
  campus: { select: { id: true, name: true } },
  section: { select: { id: true, name: true } },
  author: { select: { id: true, email: true } },
} as const

function mapToResponse(a: any): AnnouncementResponse {
  return {
    id: a.id,
    title: a.title,
    content: a.content,
    audience: a.audience,
    campusId: a.campusId ?? null,
    sectionId: a.sectionId ?? null,
    authorId: a.authorId,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    campus: a.campus ?? null,
    section: a.section ?? null,
    author: a.author,
  }
}

export const getAllAnnouncements = async (): Promise<AnnouncementResponse[]> => {
  const announcements = await prisma.announcement.findMany({
    include: announcementInclude,
    orderBy: { createdAt: 'desc' },
  })
  return announcements.map(mapToResponse)
}

export const getAnnouncementById = async (id: string): Promise<AnnouncementResponse> => {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: announcementInclude,
  })

  if (!announcement) {
    const error = new Error('Announcement not found') as any
    error.status = 404
    throw error
  }

  return mapToResponse(announcement)
}

export const getAnnouncementsForUser = async (
  audience: AnnouncementAudience[],
  campusId?: string,
  sectionId?: string
): Promise<AnnouncementResponse[]> => {
  const now = new Date()

  const announcements = await prisma.announcement.findMany({
    where: {
      audience: { in: audience },
      publishedAt: { lte: now },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
      ...(campusId ? { OR: [{ campusId }, { campusId: null }] } : {}),
      ...(sectionId ? { OR: [{ sectionId }, { sectionId: null }] } : {}),
    },
    include: announcementInclude,
    orderBy: { publishedAt: 'desc' },
  })

  return announcements.map(mapToResponse)
}

export const createAnnouncement = async (
  dto: CreateAnnouncementDto,
  authorId: string
): Promise<AnnouncementResponse> => {
  const announcement = await prisma.announcement.create({
    data: {
      title: dto.title,
      content: dto.content,
      audience: dto.audience,
      campusId: dto.campusId ?? null,
      sectionId: dto.sectionId ?? null,
      authorId,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    },
    include: announcementInclude,
  })
  return mapToResponse(announcement)
}

export const updateAnnouncement = async (
  id: string,
  dto: UpdateAnnouncementDto
): Promise<AnnouncementResponse> => {
  const existing = await prisma.announcement.findUnique({ where: { id } })
  if (!existing) {
    const error = new Error('Announcement not found') as any
    error.status = 404
    throw error
  }

  const announcement = await prisma.announcement.update({
    where: { id },
    data: {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.content !== undefined && { content: dto.content }),
      ...(dto.audience !== undefined && { audience: dto.audience }),
      ...(dto.campusId !== undefined && { campusId: dto.campusId }),
      ...(dto.sectionId !== undefined && { sectionId: dto.sectionId }),
      ...(dto.publishedAt !== undefined && {
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
      }),
      ...(dto.expiresAt !== undefined && {
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      }),
    },
    include: announcementInclude,
  })
  return mapToResponse(announcement)
}

export const deleteAnnouncement = async (id: string): Promise<void> => {
  const existing = await prisma.announcement.findUnique({ where: { id } })
  if (!existing) {
    const error = new Error('Announcement not found') as any
    error.status = 404
    throw error
  }
  await prisma.announcement.delete({ where: { id } })
}
