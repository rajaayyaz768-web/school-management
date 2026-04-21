import { logger } from '../../utils/logger'

export interface FeePaidTemplateParams {
  parentName: string
  studentName: string
  className: string
  month: string
  amount: string
  date: string
  receiptNumber: string
}

interface MetaSendResult {
  messageId: string | null
  error: string | null
}

export async function sendFeePaidTemplate(
  toPhone: string,
  params: FeePaidTemplateParams
): Promise<MetaSendResult> {
  const token = process.env.META_WHATSAPP_TOKEN
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID
  const templateName = process.env.META_WHATSAPP_TEMPLATE_NAME ?? 'fee_paid_confirmation'
  const languageCode = process.env.META_WHATSAPP_LANGUAGE_CODE ?? 'en'

  if (!token || !phoneNumberId) {
    throw new Error('META_WHATSAPP_TOKEN or META_WHATSAPP_PHONE_NUMBER_ID not configured')
  }

  const body = {
    messaging_product: 'whatsapp',
    to: toPhone.replace(/\D/g, ''),
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.parentName },
            { type: 'text', text: params.studentName },
            { type: 'text', text: params.className },
            { type: 'text', text: params.month },
            { type: 'text', text: params.amount },
            { type: 'text', text: params.date },
            { type: 'text', text: params.receiptNumber },
          ],
        },
      ],
    },
  }

  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  const json = (await response.json()) as any

  if (!response.ok) {
    const errMsg = json?.error?.message ?? `HTTP ${response.status}`
    logger.warn('[WhatsApp] Meta API error', { status: response.status, error: json?.error })
    return { messageId: null, error: errMsg }
  }

  const messageId = json?.messages?.[0]?.id ?? null
  return { messageId, error: null }
}
