const DEFAULT_WEB_ORIGIN = 'http://localhost:5173'

function normalizeOrigin(origin?: string | null): string {
  const source = String(origin || '').trim()
  const fallback =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : DEFAULT_WEB_ORIGIN
  return (source || fallback).replace(/\/+$/, '')
}

export function getGroupLinkOrigin(): string {
  return normalizeOrigin(import.meta.env.VITE_WEB_APP_ORIGIN)
}

export function buildGroupLinkUrl(token: string): string {
  const cleanToken = String(token || '').trim()
  if (!cleanToken) return ''
  return `${getGroupLinkOrigin()}/g/${cleanToken}`
}

export function extractGroupLinkToken(raw?: string | null): string {
  const match = String(raw || '').match(/\/g\/([A-Za-z0-9_-]+)/i)
  return match?.[1] || ''
}
