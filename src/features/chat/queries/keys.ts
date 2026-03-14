export const chatKeys = {
  all: () => ['chat'] as const,
  conversations: () => [...chatKeys.all(), 'conversations'] as const,
  messages: (recipientId: string) => [...chatKeys.all(), 'messages', recipientId] as const
}
