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
    sent: 'chat.status.sent',
    membersCount: 'chat.status.membersCount'
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
  sidebar: {
    all: 'chat.sidebar.all',
    unread: 'chat.sidebar.unread',
    category: 'chat.sidebar.category',
    createGroup: 'chat.sidebar.createGroup',
    addFriend: 'chat.sidebar.addFriend'
  },
  'create-group-dialog': {
    title: 'chat.create-group-dialog.title',
    namePlaceholder: 'chat.create-group-dialog.namePlaceholder',
    searchPlaceholder: 'chat.create-group-dialog.searchPlaceholder',
    recentChats: 'chat.create-group-dialog.recentChats',
    selected: 'chat.create-group-dialog.selected',
    cancel: 'chat.create-group-dialog.cancel',
    create: 'chat.create-group-dialog.create',
    noSelected: 'chat.create-group-dialog.noSelected',
    andOthers: 'chat.create-group-dialog.andOthers'
  }
} as const
