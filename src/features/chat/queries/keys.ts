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
    [...chatKeys.all(), 'group-members', conversationId, query] as const,
  pins: (conversationId: string) => [...chatKeys.all(), 'pins', conversationId] as const,
  groupAdmins: (conversationId: string) => [...chatKeys.all(), 'group-admins', conversationId] as const,
  adminCandidates: (conversationId: string, query: string) =>
    [...chatKeys.all(), 'admin-candidates', conversationId, query] as const,
  joinRequests: (conversationId: string) => [...chatKeys.all(), 'join-requests', conversationId] as const,
  joinPreview: (token: string) => [...chatKeys.all(), 'join-preview', token] as const,
  blockedMembers: (conversationId: string) => [...chatKeys.all(), 'blocked-members', conversationId] as const,
  blockCandidates: (conversationId: string, query: string) =>
    [...chatKeys.all(), 'block-candidates', conversationId, query] as const
}
