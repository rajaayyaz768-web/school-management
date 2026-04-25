import { Request, Response } from 'express'
import { Role, AnnouncementAudience } from '@prisma/client'
import * as service from './announcements.service'
import { sendSuccess, sendCreated, sendError } from '../../utils/response'

const audienceForRole: Record<Role, AnnouncementAudience[]> = {
  [Role.STUDENT]:     [AnnouncementAudience.STUDENTS, AnnouncementAudience.ALL],
  [Role.PARENT]:      [AnnouncementAudience.PARENTS,  AnnouncementAudience.ALL],
  [Role.TEACHER]:     [AnnouncementAudience.TEACHERS, AnnouncementAudience.ALL],
  [Role.ADMIN]:       [AnnouncementAudience.ALL, AnnouncementAudience.STUDENTS, AnnouncementAudience.PARENTS, AnnouncementAudience.TEACHERS, AnnouncementAudience.SECTION],
  [Role.SUPER_ADMIN]: [AnnouncementAudience.ALL, AnnouncementAudience.STUDENTS, AnnouncementAudience.PARENTS, AnnouncementAudience.TEACHERS, AnnouncementAudience.SECTION],
}

export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const campusId = req.query.campus_id as string | undefined
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const result = await service.getAllAnnouncements(campusId, { page, limit })
    return sendSuccess(res, 'Announcements fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getAnnouncementById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const result = await service.getAnnouncementById(id)
    return sendSuccess(res, 'Announcement fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getAnnouncementsForUser = async (req: Request, res: Response) => {
  try {
    const { campusId, sectionId } = req.query as { campusId?: string; sectionId?: string }
    const audienceList = audienceForRole[req.user!.role] ?? [AnnouncementAudience.ALL]
    const result = await service.getAnnouncementsForUser(audienceList, campusId, sectionId)
    return sendSuccess(res, 'Announcements fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const authorId = req.user!.id
    const result = await service.createAnnouncement(req.body, authorId)
    return sendCreated(res, 'Announcement created successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const result = await service.updateAnnouncement(id, req.body)
    return sendSuccess(res, 'Announcement updated successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    await service.deleteAnnouncement(id)
    return sendSuccess(res, 'Announcement deleted successfully', null)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}
