import type { TFunction } from 'i18next'
import { CHAT_KEYS } from './chat.keys'
import type { AiProcessingStatus } from '@/constants/enum'

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
    sent: t(CHAT_KEYS.status.sent)
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
  systemFriendship: {
    defaultPartnerName: t(CHAT_KEYS.systemFriendship.defaultPartnerName),
    acceptedBy: (name: string) => t(CHAT_KEYS.systemFriendship.acceptedBy, { name }),
    acceptedSuffix: t(CHAT_KEYS.systemFriendship.acceptedSuffix),
    becameFriendsWith: (name: string) => t(CHAT_KEYS.systemFriendship.becameFriendsWith, { name }),
    becameFriendsPrefix: t(CHAT_KEYS.systemFriendship.becameFriendsPrefix),
    cardTitle: t(CHAT_KEYS.systemFriendship.cardTitle),
    cardDescription: (name: string) => t(CHAT_KEYS.systemFriendship.cardDescription, { name }),
    sendGreeting: t(CHAT_KEYS.systemFriendship.sendGreeting),
    greetingMessage: t(CHAT_KEYS.systemFriendship.greetingMessage)
  },
  /** Trả về label dịch cho trạng thái pipeline AI theo ngôn ngữ hiện tại */
  aiStatusLabel: (status?: AiProcessingStatus): string => {
    if (!status) return t(CHAT_KEYS.aiStatus.DEFAULT)
    const key = CHAT_KEYS.aiStatus[status as keyof typeof CHAT_KEYS.aiStatus]
    return key ? t(key) : t(CHAT_KEYS.aiStatus.DEFAULT)
  }
})
