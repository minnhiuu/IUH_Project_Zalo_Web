export const BUSINESS_CARD_PREFIX = '[BUSINESS_CARD]::'

export type BusinessCardPayload = {
  userId: string
  name: string
  phone?: string
  avatar?: string | null
  qrValue?: string
}

export function serializeBusinessCard(payload: BusinessCardPayload): string {
  return `${BUSINESS_CARD_PREFIX}${JSON.stringify(payload)}`
}

export function parseBusinessCardContent(content?: string | null): BusinessCardPayload | null {
  if (!content || typeof content !== 'string') return null
  if (!content.startsWith(BUSINESS_CARD_PREFIX)) return null

  try {
    const parsed = JSON.parse(content.slice(BUSINESS_CARD_PREFIX.length))
    if (!parsed || typeof parsed !== 'object') return null
    if (!parsed.userId || !parsed.name) return null

    return {
      userId: String(parsed.userId),
      name: String(parsed.name),
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      avatar: typeof parsed.avatar === 'string' ? parsed.avatar : null,
      qrValue: typeof parsed.qrValue === 'string' ? parsed.qrValue : undefined
    }
  } catch {
    return null
  }
}
