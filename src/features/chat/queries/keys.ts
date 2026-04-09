export const chatKeys = {
  all: () => ['chat'] as const,
  conversations: () => [...chatKeys.all(), 'conversations'] as const,
  // Key theo conversationId (MongoDB ObjectId) thay vì recipientId
  messages: (conversationId: string) => [...chatKeys.all(), 'messages', conversationId] as const
}
