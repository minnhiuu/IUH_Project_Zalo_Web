import type { ConversationResponse } from '../schemas/chat.schema'

export const getConversationDisplayName = (
  conversation: ConversationResponse,
  fallback = 'Group',
  andOthersText?: (count: number) => string,
  currentUserId?: string | null
): string => {
  if (conversation.name) return conversation.name
  if (conversation.isGroup && conversation.members?.length) {
    // When the group has only 2 members, include the current user in the display name
    // (filtering them out would leave only 1 name which is ambiguous)
    const shouldFilterCurrentUser = currentUserId && conversation.members.length > 2

    const filteredNames = conversation.members
      .filter((m) => (shouldFilterCurrentUser ? String(m.userId) !== String(currentUserId) : true))
      .map((m) => m.fullName)
      .filter(Boolean)

    if (filteredNames.length === 0) return fallback

    return formatDefaultGroupName(filteredNames, andOthersText)
  }
  return fallback
}

export const formatDefaultGroupName = (names: string[], andOthersText?: (count: number) => string): string => {
  if (!names || names.length === 0) return ''

  if (names.length <= 4) {
    return names.join(', ')
  }

  const visibleNames = names.slice(0, 4).join(', ')
  const remainingCount = names.length - 4

  return andOthersText
    ? `${visibleNames} ${andOthersText(remainingCount)}`
    : `${visibleNames} và ${remainingCount} người khác`
}
