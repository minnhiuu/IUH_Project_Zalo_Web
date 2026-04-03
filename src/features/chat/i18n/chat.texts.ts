import type { TFunction } from 'i18next'
import { CHAT_KEYS } from './chat.keys'

export const createChatTexts = (t: TFunction<'chat'>) => ({
  title: t(CHAT_KEYS.title),
  searchPlaceholder: t(CHAT_KEYS.searchPlaceholder),
  emptyState: t(CHAT_KEYS.emptyState),
  inputPlaceholder: t(CHAT_KEYS.inputPlaceholder),
  send: t(CHAT_KEYS.send),
  status: {
    online: t(CHAT_KEYS.status.online),
    justNow: t(CHAT_KEYS.status.justNow),
    minutesAgo: (count: number) => t(CHAT_KEYS.status.minutesAgo, { count }),
    hoursAgo: (count: number) => t(CHAT_KEYS.status.hoursAgo, { count }),
    daysAgo: (count: number) => t(CHAT_KEYS.status.daysAgo, { count }),
    onDate: (date: string) => t(CHAT_KEYS.status.onDate, { date }),
    sending: t(CHAT_KEYS.status.sending),
    sent: t(CHAT_KEYS.status.sent),
    membersCount: (count: number) => t(CHAT_KEYS.status.membersCount, { count })
  },
  errors: {
    loadConversations: t(CHAT_KEYS.errors.loadConversations),
    loadMessages: t(CHAT_KEYS.errors.loadMessages)
  },
  you: t(CHAT_KEYS.you),
  user: t(CHAT_KEYS.user),
  type: {
    image: t(CHAT_KEYS.type.image),
    file: t(CHAT_KEYS.type.file)
  },
  sidebar: {
    all: t(CHAT_KEYS.sidebar.all),
    unread: t(CHAT_KEYS.sidebar.unread),
    category: t(CHAT_KEYS.sidebar.category),
    createGroup: t(CHAT_KEYS.sidebar.createGroup),
    addFriend: t(CHAT_KEYS.sidebar.addFriend)
  },
  'create-group-dialog': {
    title: t(CHAT_KEYS['create-group-dialog'].title),
    namePlaceholder: t(CHAT_KEYS['create-group-dialog'].namePlaceholder),
    searchPlaceholder: t(CHAT_KEYS['create-group-dialog'].searchPlaceholder),
    recentChats: t(CHAT_KEYS['create-group-dialog'].recentChats),
    selected: t(CHAT_KEYS['create-group-dialog'].selected),
    cancel: t(CHAT_KEYS['create-group-dialog'].cancel),
    create: t(CHAT_KEYS['create-group-dialog'].create),
    noSelected: t(CHAT_KEYS['create-group-dialog'].noSelected),
    andOthers: (count: number) => t(CHAT_KEYS['create-group-dialog'].andOthers, { count })
  }
})
