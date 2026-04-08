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
  },
  aiStatus: {
    ANALYZING_INTENT: 'ai.status.ANALYZING_INTENT',
    RETRIEVING_VECTOR: 'ai.status.RETRIEVING_VECTOR',
    GRADING_DATA: 'ai.status.GRADING_DATA',
    WEB_SEARCHING: 'ai.status.WEB_SEARCHING',
    GENERATING_ANSWER: 'ai.status.GENERATING_ANSWER',
    DEFAULT: 'ai.status.DEFAULT'
  }
} as const
