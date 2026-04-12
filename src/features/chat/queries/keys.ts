export const chatKeys = {
  all: () => ['chat'] as const,
  conversations: () => [...chatKeys.all(), 'conversations'] as const,
  messages: (conversationId: string) => [...chatKeys.all(), 'messages', conversationId] as const,
  media: (conversationId: string, types: string[]) =>
    [...chatKeys.all(), 'media', conversationId, types.join(',')] as const,
  friendsDirectory: (conversationId?: string | null) =>
    [...chatKeys.all(), 'friends-directory', conversationId || 'none'] as const,
  searchMembers: (query: string, conversationId?: string | null) =>
    [...chatKeys.all(), 'search-members', query, conversationId || 'none'] as const,
  groupMembers: (conversationId: string, query: string) =>
    [...chatKeys.all(), 'group-members', conversationId, query] as const
}
