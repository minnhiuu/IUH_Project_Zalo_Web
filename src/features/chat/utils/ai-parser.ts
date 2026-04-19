/** Tách <suggestions>Q1|Q2</suggestions> ra khỏi content. */
export function parseAiSuggestions(raw: string): { cleanContent: string; suggestions: string[] } {
  if (!raw) return { cleanContent: '', suggestions: [] };
  const match = raw.match(/<suggestions>(.*?)<\/suggestions>/s)
  if (!match) return { cleanContent: raw.trim(), suggestions: [] }
  const suggestions = match[1]
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
  const cleanContent = raw.replace(/<suggestions>.*?<\/suggestions>/s, '').trim()
  return { cleanContent, suggestions }
}

/**
 * Tách <question>...</question> — dùng để nhận dạng CLARIFICATION khi load từ DB.
 * Returns { cleanContent, isClarification }.
 */
export function parseAiQuestion(raw: string): { cleanContent: string; isClarification: boolean } {
  if (!raw) return { cleanContent: '', isClarification: false };
  const match = raw.match(/<question>(.*?)<\/question>/s)
  if (!match) return { cleanContent: raw.trim(), isClarification: false }
  return { cleanContent: match[1].trim(), isClarification: true }
}

export const AI_SUGGESTION_EVENT = 'bondhub-ai-suggestion-clicked'
