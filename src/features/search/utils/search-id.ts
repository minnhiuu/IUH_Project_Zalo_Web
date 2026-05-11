export function generateKeywordId(keyword: string): string {
  const normalized = keyword.trim().toLowerCase()
  const hex = Array.from(normalized)
    .map((c) => c.charCodeAt(0).toString(16))
    .join('')

  return hex.substring(0, 24).padEnd(24, '0')
}
