import { Request, Response } from 'express'
import * as service from './announcements.service'
import { sendSuccess, sendCreated, sendError } from '../../utils/response'

export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const result = await service.getAllAnnouncements()
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
    const { audience, campusId, sectionId } = req.query as {
      audience?: string
      campusId?: string
      sectionId?: string
    }

    const audienceList = audience
      ? (audience.split(',') as any[])
      : ['ALL']

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
