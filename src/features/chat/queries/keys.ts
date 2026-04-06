export const chatKeys = {
  all: () => ['chat'] as const,
  conversations: () => [...chatKeys.all(), 'conversations'] as const,
  // Key theo conversationId (MongoDB ObjectId) thay vì recipientId
  messages: (conversationId: string) => [...chatKeys.all(), 'messages', conversationId] as const,
  friendsDirectory: (conversationId?: string | null) =>
    [...chatKeys.all(), 'friends-directory', conversationId || 'none'] as const,
  searchMembers: (query: string, conversationId?: string | null) =>
    [...chatKeys.all(), 'search-members', query, conversationId || 'none'] as const
}
