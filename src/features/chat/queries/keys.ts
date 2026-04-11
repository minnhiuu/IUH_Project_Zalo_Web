export const chatKeys = {
  all: () => ['chat'] as const,
  conversations: () => [...chatKeys.all(), 'conversations'] as const,
  // Key theo conversationId (MongoDB ObjectId) thay vì recipientId
  messages: (conversationId: string) => [...chatKeys.all(), 'messages', conversationId] as const,
  friendsDirectory: (conversationId?: string | null) =>
    [...chatKeys.all(), 'friends-directory', conversationId || 'none'] as const,
  searchMembers: (query: string, conversationId?: string | null) =>
    [...chatKeys.all(), 'search-members', query, conversationId || 'none'] as const,
  groupMembers: (conversationId: string, query: string) =>
    [...chatKeys.all(), 'group-members', conversationId, query] as const,
  joinRequests: (conversationId: string) => [...chatKeys.all(), 'join-requests', conversationId] as const,
  joinPreview: (token: string) => [...chatKeys.all(), 'join-preview', token] as const
}
