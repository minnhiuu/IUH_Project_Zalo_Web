export const CHAT_KEYS = {
  title: 'chat.title',
  searchPlaceholder: 'chat.searchPlaceholder',
  emptyState: 'chat.emptyState',
  inputPlaceholder: 'chat.inputPlaceholder',
  send: 'chat.send',
  status: {
    online: 'chat.status.online',
    lastSeen: 'chat.status.lastSeen',
    sending: 'chat.status.sending',
    sent: 'chat.status.sent'
  },
  errors: {
    loadConversations: 'chat.errors.loadConversations',
    loadMessages: 'chat.errors.loadMessages'
  }
} as const
