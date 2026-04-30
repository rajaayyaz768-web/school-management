import { logger } from '../../utils/logger'

// Normalise Pakistani phone numbers to WhatsApp international format (no +)
// 03001234567 → 923001234567
// +923001234567 → 923001234567
// 923001234567 → 923001234567
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('92')) return digits
  if (digits.startsWith('0')) return '92' + digits.slice(1)
  return digits
}

export interface CredentialsTemplateParams {
  parentName: string
  studentName: string
  campusName: string
  sectionLabel: string  // e.g. "FSc Pre-Medical Part 1 — Section A"
  rollNumber: string
  studentPassword: string
  parentCnic: string
  parentPassword: string
  appUrl: string
}

export async function sendCredentialsWhatsApp(
  toPhone: string,
  params: CredentialsTemplateParams
): Promise<MetaSendResult> {
  const token = process.env.META_WHATSAPP_TOKEN
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID
  const templateName = process.env.META_WHATSAPP_CREDENTIALS_TEMPLATE ?? 'student_login_credentials'
  const languageCode = process.env.META_WHATSAPP_LANGUAGE_CODE ?? 'en'

  if (!token || !phoneNumberId) {
    logger.warn('[WhatsApp] META_WHATSAPP_TOKEN or META_WHATSAPP_PHONE_NUMBER_ID not configured — credentials not sent')
    return { messageId: null, error: 'WhatsApp not configured' }
  }

  const body = {
    messaging_product: 'whatsapp',
    to: normalizePhone(toPhone),
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
            { type: 'text', text: params.campusName },
            { type: 'text', text: params.sectionLabel },
            { type: 'text', text: params.rollNumber },
            { type: 'text', text: params.studentPassword },
            { type: 'text', text: params.parentCnic },
            { type: 'text', text: params.parentPassword },
            { type: 'text', text: params.appUrl },
          ],
        },
      ],
    },
  }

  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })

    const json = (await response.json()) as any

    if (!response.ok) {
      const errMsg = json?.error?.message ?? `HTTP ${response.status}`
      logger.warn('[WhatsApp] Credentials template error', { status: response.status, error: json?.error })
      return { messageId: null, error: errMsg }
    }

    return { messageId: json?.messages?.[0]?.id ?? null, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    logger.warn('[WhatsApp] Credentials send failed', { error: msg })
    return { messageId: null, error: msg }
  }
}

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
    to: normalizePhone(toPhone),
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
