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
  you_lower: t(CHAT_KEYS.you_lower),
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
    andOthers: (count: number) => t(CHAT_KEYS['create-group-dialog'].andOthers, { count }),
    updateAvatarTitle: t(CHAT_KEYS['create-group-dialog'].updateAvatarTitle),
    confirm: t(CHAT_KEYS['create-group-dialog'].confirm),
    dragToMove: t(CHAT_KEYS['create-group-dialog'].dragToMove),
    changeAvatar: t(CHAT_KEYS['create-group-dialog'].changeAvatar),
    removeAvatar: t(CHAT_KEYS['create-group-dialog'].removeAvatar)
  },
  system: {
    add_members: {
      single_self: (actor: string) => t(CHAT_KEYS.system.add_members.single_self, { actor }),
      many_self: (firstTarget: string, count: number, actor: string) =>
        t(CHAT_KEYS.system.add_members.many_self, { firstTarget, count, actor }),
      many_self_count: (firstTarget: string, count: number, actor: string) =>
        t(CHAT_KEYS.system.add_members.many_self_count, { firstTarget, count, actor }),
      single_other: (target: string, actor: string) => t(CHAT_KEYS.system.add_members.single_other, { target, actor }),
      many_other: (firstTarget: string, count: number, actor: string) =>
        t(CHAT_KEYS.system.add_members.many_other, { firstTarget, count, actor }),
      many_other_count: (firstTarget: string, count: number, actor: string) =>
        t(CHAT_KEYS.system.add_members.many_other_count, { firstTarget, count, actor }),
      update_name_simple: t(CHAT_KEYS.system.add_members.update_name_simple),
      update_avatar_simple: t(CHAT_KEYS.system.add_members.update_avatar_simple)
    }
  },
  'rename-group-dialog': {
    title: t(CHAT_KEYS['rename-group-dialog'].title),
    description: t(CHAT_KEYS['rename-group-dialog'].description),
    placeholder: t(CHAT_KEYS['rename-group-dialog'].placeholder),
    cancel: t(CHAT_KEYS['rename-group-dialog'].cancel),
    confirm: t(CHAT_KEYS['rename-group-dialog'].confirm)
  },
  'group-info-dialog': {
    title: t(CHAT_KEYS['group-info-dialog'].title),
    membersCount: (count: number) => t(CHAT_KEYS['group-info-dialog'].members, { count }),
    management: t(CHAT_KEYS['group-info-dialog'].management),
    leaveGroup: t(CHAT_KEYS['group-info-dialog'].leaveGroup),
    viewAll: t(CHAT_KEYS['group-info-dialog'].viewAll),
    media: t(CHAT_KEYS['group-info-dialog'].media),
    noMedia: t(CHAT_KEYS['group-info-dialog'].noMedia),
    sendMessage: t(CHAT_KEYS['group-info-dialog'].sendMessage),
    groupLink: t(CHAT_KEYS['group-info-dialog'].groupLink)
  },
  toasts: {
    updating: t(CHAT_KEYS.toasts.updating),
    updateAvatarSuccess: t(CHAT_KEYS.toasts.updateAvatarSuccess),
    updateNameSuccess: t(CHAT_KEYS.toasts.updateNameSuccess),
    updateError: t(CHAT_KEYS.toasts.updateError)
  },
  sidebarInfo: {
    title: t(CHAT_KEYS.sidebarInfo.title),
    groupTitle: t(CHAT_KEYS.sidebarInfo.groupTitle),
    members: t(CHAT_KEYS.sidebarInfo.members),
    groupBoard: t(CHAT_KEYS.sidebarInfo.groupBoard),
    reminderBoard: t(CHAT_KEYS.sidebarInfo.reminderBoard),
    notesPinsPolls: t(CHAT_KEYS.sidebarInfo.notesPinsPolls),
    commonGroups: t(CHAT_KEYS.sidebarInfo.commonGroups),
    noCommonGroups: t(CHAT_KEYS.sidebarInfo.noCommonGroups),
    photosVideos: t(CHAT_KEYS.sidebarInfo.photosVideos),
    noPhotosVideos: t(CHAT_KEYS.sidebarInfo.noPhotosVideos),
    files: t(CHAT_KEYS.sidebarInfo.files),
    noFiles: t(CHAT_KEYS.sidebarInfo.noFiles),
    links: t(CHAT_KEYS.sidebarInfo.links),
    noLinks: t(CHAT_KEYS.sidebarInfo.noLinks),
    privacySettings: t(CHAT_KEYS.sidebarInfo.privacySettings),
    disappearingMessages: t(CHAT_KEYS.sidebarInfo.disappearingMessages),
    disappearingMessagesTooltip: t(CHAT_KEYS.sidebarInfo.disappearingMessagesTooltip),
    disappearingMessagesWarning: t(CHAT_KEYS.sidebarInfo.disappearingMessagesWarning),
    never: t(CHAT_KEYS.sidebarInfo.never),
    hideConversation: t(CHAT_KEYS.sidebarInfo.hideConversation),
    reportAction: t(CHAT_KEYS.sidebarInfo.reportAction),
    deleteHistory: t(CHAT_KEYS.sidebarInfo.deleteHistory),
    leaveGroup: t(CHAT_KEYS.sidebarInfo.leaveGroup),
    viewAllMembers: t(CHAT_KEYS.sidebarInfo.viewAllMembers),
    muteNotifications: t(CHAT_KEYS.sidebarInfo.muteNotifications),
    pin: t(CHAT_KEYS.sidebarInfo.pin),
    addMember: t(CHAT_KEYS.sidebarInfo.addMember),
    settings: t(CHAT_KEYS.sidebarInfo.settings),
    createGroup: t(CHAT_KEYS.sidebarInfo.createGroup)
  }
})
