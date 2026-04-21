import prisma from '../../config/database'
import { logger } from '../../utils/logger'
import { sendFeePaidTemplate, FeePaidTemplateParams } from '../../services/whatsapp/metaClient'

export async function sendFeePaidWhatsApp(
  toPhone: string,
  params: FeePaidTemplateParams,
  templateName: string
): Promise<void> {
  const enabled = process.env.META_WHATSAPP_ENABLED === 'true'

  if (!enabled) {
    logger.info('[WhatsApp] Feature flag off — skipping send', { toPhone, params })
    await prisma.outgoingMessage.create({
      data: {
        toPhone,
        channel: 'WHATSAPP',
        templateName,
        payload: params as any,
        status: 'SKIPPED',
      },
    })
    return
  }

  try {
    const result = await sendFeePaidTemplate(toPhone, params)
    await prisma.outgoingMessage.create({
      data: {
        toPhone,
        channel: 'WHATSAPP',
        templateName,
        payload: params as any,
        status: result.error ? 'FAILED' : 'SENT',
        providerMessageId: result.messageId ?? undefined,
        errorText: result.error ?? undefined,
      },
    })
    if (result.error) {
      logger.warn('[WhatsApp] Message failed', { toPhone, error: result.error })
    } else {
      logger.info('[WhatsApp] Message sent', { toPhone, messageId: result.messageId })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error('[WhatsApp] Unexpected error', { toPhone, error: msg })
    try {
      await prisma.outgoingMessage.create({
        data: {
          toPhone,
          channel: 'WHATSAPP',
          templateName,
          payload: params as any,
          status: 'FAILED',
          errorText: msg,
        },
      })
    } catch {
      // DB write failure — already logged, never rethrow
    }
  }
}
