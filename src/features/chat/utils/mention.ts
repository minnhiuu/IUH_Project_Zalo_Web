import { BONDHUB_AI } from '@/constants/system'
import { stripAiControlTags } from './ai-parser'

export const MENTION_REGEX = /(@<mention>.*?<\/mention>)/g

/**
 * Kiểm tra xem người dùng có mention AI hay không.
 * Quét chuỗi an toàn bỏ qua các khoảng trắng thừa ngầm.
 */
export function isAiMentioned(content: string): boolean {
  if (!content) return false

  // Regex linh hoạt hơn: bắt @<mention>Bondhub AI</mention> hoặc biến thể khoảng trắng
  const pattern = `@<mention>\\s*${BONDHUB_AI.fullName.replace(/\s+/g, '\\s*')}\\s*<\\/mention>`
  const aiRegex = new RegExp(pattern, 'i')
  return aiRegex.test(content)
}

/**
 * Strips HTML mention tags to plain text.
 * Useful for previews like Sidebar, Notifications, Pinboard snapshot preview, etc.
 * Example: "Hello @<mention>Minh</mention>" -> "Hello @Minh"
 */
export function stripMentionsForPreview(content: string | undefined | null): string {
  if (!content) return ''
  const withoutMentions = content.replace(/@<mention>(.*?)<\/mention>/g, '@$1')
  return stripAiControlTags(withoutMentions)
}

/**
 * Parses content into parts for React rendering.
 * Returns an array of objects to map over in JSX.
 */
export function parseMentionsForRender(content: string | undefined | null) {
  if (!content) return []
  return content.split(MENTION_REGEX).map((part, i) => {
    if (part.startsWith('@<mention>') && part.endsWith('</mention>')) {
      const name = part.slice(10, -10).trim()
      return { isMention: true, text: `@${name}`, key: i }
    }
    return { isMention: false, text: part, key: i }
  })
}
