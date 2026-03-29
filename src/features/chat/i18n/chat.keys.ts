export const CHAT_KEYS = {
  title: 'chat.title',
  searchPlaceholder: 'chat.searchPlaceholder',
  emptyState: 'chat.emptyState',
  inputPlaceholder: 'chat.inputPlaceholder',
  send: 'chat.send',
  status: {
    online: 'chat.status.online',
    justNow: 'chat.status.justNow',
    minutesAgo: 'chat.status.minutesAgo',
    hoursAgo: 'chat.status.hoursAgo',
    daysAgo: 'chat.status.daysAgo',
    onDate: 'chat.status.onDate',
    sending: 'chat.status.sending',
    sent: 'chat.status.sent'
  },
  errors: {
    loadConversations: 'chat.errors.loadConversations',
    loadMessages: 'chat.errors.loadMessages'
  },
  you: 'chat.you',
  user: 'chat.user',
  type: {
    image: 'chat.type.image',
    file: 'chat.type.file'
  }
} as const
