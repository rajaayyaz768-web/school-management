import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()

  // Log incoming request
  logger.request(req)

  // Log form data for POST and PUT (not GET)
  if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && req.body && Object.keys(req.body).length > 0) {
    const user = (req as any).user
    logger.formData(req.originalUrl, req.body, user?.id)
  }

  // Intercept response finish to log response
  res.on('finish', () => {
    const duration = Date.now() - startTime
    logger.response(req, res.statusCode, duration)
  })

  next()
}
