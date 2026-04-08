import type { TFunction } from 'i18next'
import { CHAT_KEYS } from './chat.keys'
import type { AiProcessingStatus } from '@/constants/enum'

export const createChatTexts = (t: TFunction<'chat'>) => ({
  title: t(CHAT_KEYS.title),
  searchPlaceholder: t(CHAT_KEYS.searchPlaceholder),
  emptyState: t(CHAT_KEYS.emptyState),
  emptyStateSearch: t(CHAT_KEYS.emptyStateSearch),
  inputPlaceholder: t(CHAT_KEYS.inputPlaceholder),
  send: t(CHAT_KEYS.send),
  loading: t(CHAT_KEYS.loading),
  replyingTo: (name: string) => t(CHAT_KEYS.replyingTo, { name }),
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
    removeAvatar: t(CHAT_KEYS['create-group-dialog'].removeAvatar),
    addMembersTitle: t(CHAT_KEYS['create-group-dialog'].addMembersTitle),
    alreadyJoined: t(CHAT_KEYS['create-group-dialog'].alreadyJoined)
  },
  system: {
    add_members: {
      single_self: t(CHAT_KEYS.system.add_members.single_self),
      many_self: t(CHAT_KEYS.system.add_members.many_self),
      many_self_count: t(CHAT_KEYS.system.add_members.many_self_count),
      single_other: t(CHAT_KEYS.system.add_members.single_other),
      many_other: t(CHAT_KEYS.system.add_members.many_other),
      many_other_count: t(CHAT_KEYS.system.add_members.many_other_count),
      group_created: t(CHAT_KEYS.system.add_members.group_created),
      joined_group: t(CHAT_KEYS.system.add_members.joined_group),
      update_name: t(CHAT_KEYS.system.add_members.update_name),
      update_name_simple: t(CHAT_KEYS.system.add_members.update_name_simple),
      update_avatar: t(CHAT_KEYS.system.add_members.update_avatar),
      update_avatar_simple: t(CHAT_KEYS.system.add_members.update_avatar_simple),
      disband_group: t(CHAT_KEYS.system.add_members.disband_group)
    },
    remove_member: {
      by_you: t(CHAT_KEYS.system.remove_member.by_you),
      self_removed: t(CHAT_KEYS.system.remove_member.self_removed),
      by_actor: t(CHAT_KEYS.system.remove_member.by_actor)
    },
    leave_group: {
      self: t(CHAT_KEYS.system.leave_group.self),
      by_actor: t(CHAT_KEYS.system.leave_group.by_actor)
    }
  },
  disbanded: {
    message: t(CHAT_KEYS.disbanded.message),
    cannotSendMessage: t(CHAT_KEYS.disbanded.cannotSendMessage),
    deleteAction: t(CHAT_KEYS.disbanded.deleteAction)
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
    managementTitle: t(CHAT_KEYS['group-info-dialog'].managementTitle),
    backToInfo: t(CHAT_KEYS['group-info-dialog'].backToInfo),
    members: t(CHAT_KEYS['group-info-dialog'].members),
    management: t(CHAT_KEYS['group-info-dialog'].management),
    leaveGroup: t(CHAT_KEYS['group-info-dialog'].leaveGroup),
    viewAll: t(CHAT_KEYS['group-info-dialog'].viewAll),
    media: t(CHAT_KEYS['group-info-dialog'].media),
    noMedia: t(CHAT_KEYS['group-info-dialog'].noMedia),
    sendMessage: t(CHAT_KEYS['group-info-dialog'].sendMessage),
    groupLink: t(CHAT_KEYS['group-info-dialog'].groupLink),
    memberPermissionsTitle: t(CHAT_KEYS['group-info-dialog'].memberPermissionsTitle),
    permissions: {
      updateNameAvatar: t(CHAT_KEYS['group-info-dialog'].permissions.updateNameAvatar),
      pinNotePoll: t(CHAT_KEYS['group-info-dialog'].permissions.pinNotePoll),
      createReminder: t(CHAT_KEYS['group-info-dialog'].permissions.createReminder),
      createPoll: t(CHAT_KEYS['group-info-dialog'].permissions.createPoll),
      sendMessage: t(CHAT_KEYS['group-info-dialog'].permissions.sendMessage)
    },
    toggles: {
      reviewNewMembers: t(CHAT_KEYS['group-info-dialog'].toggles.reviewNewMembers),
      highlightAdminMessages: t(CHAT_KEYS['group-info-dialog'].toggles.highlightAdminMessages),
      allowNewMembersReadRecent: t(CHAT_KEYS['group-info-dialog'].toggles.allowNewMembersReadRecent),
      allowJoinByLink: t(CHAT_KEYS['group-info-dialog'].toggles.allowJoinByLink)
    },
    toggleTooltips: {
      reviewNewMembers: t(CHAT_KEYS['group-info-dialog'].toggleTooltips.reviewNewMembers),
      highlightAdminMessages: t(CHAT_KEYS['group-info-dialog'].toggleTooltips.highlightAdminMessages),
      allowNewMembersReadRecent: t(CHAT_KEYS['group-info-dialog'].toggleTooltips.allowNewMembersReadRecent),
      allowJoinByLink: t(CHAT_KEYS['group-info-dialog'].toggleTooltips.allowJoinByLink)
    },
    actions: {
      removeMembers: t(CHAT_KEYS['group-info-dialog'].actions.removeMembers),
      ownerAndDeputy: t(CHAT_KEYS['group-info-dialog'].actions.ownerAndDeputy),
      disbandGroup: t(CHAT_KEYS['group-info-dialog'].actions.disbandGroup),
      disbandDialog: {
        title: t(CHAT_KEYS['group-info-dialog'].actions.disbandDialog.title),
        description: t(CHAT_KEYS['group-info-dialog'].actions.disbandDialog.description),
        confirm: t(CHAT_KEYS['group-info-dialog'].actions.disbandDialog.confirm),
        cancel: t(CHAT_KEYS['group-info-dialog'].actions.disbandDialog.cancel)
      },
      leaveDialog: {
        title: t(CHAT_KEYS['group-info-dialog'].actions.leaveDialog.title),
        description: t(CHAT_KEYS['group-info-dialog'].actions.leaveDialog.description),
        silentTitle: t(CHAT_KEYS['group-info-dialog'].actions.leaveDialog.silentTitle),
        silentDescription: t(CHAT_KEYS['group-info-dialog'].actions.leaveDialog.silentDescription),
        confirm: t(CHAT_KEYS['group-info-dialog'].actions.leaveDialog.confirm),
        cancel: t(CHAT_KEYS['group-info-dialog'].actions.leaveDialog.cancel)
      }
    }
  },
  toasts: {
    updating: t(CHAT_KEYS.toasts.updating),
    updateAvatarSuccess: t(CHAT_KEYS.toasts.updateAvatarSuccess),
    updateNameSuccess: t(CHAT_KEYS.toasts.updateNameSuccess),
    updateError: t(CHAT_KEYS.toasts.updateError),
    leaveGroupSuccess: t(CHAT_KEYS.toasts.leaveGroupSuccess),
    leaveGroupError: t(CHAT_KEYS.toasts.leaveGroupError)
  },
  sidebarInfo: {
    title: t(CHAT_KEYS.sidebarInfo.title),
    groupTitle: t(CHAT_KEYS.sidebarInfo.groupTitle),
    members: t(CHAT_KEYS.sidebarInfo.members),
    groupBoard: t(CHAT_KEYS.sidebarInfo.groupBoard),
    reminderBoard: t(CHAT_KEYS.sidebarInfo.reminderBoard),
    notesPinsPolls: t(CHAT_KEYS.sidebarInfo.notesPinsPolls),
    commonGroups: t(CHAT_KEYS.sidebarInfo.commonGroups),
    commonGroupsCount: t(CHAT_KEYS.sidebarInfo.commonGroupsCount),
    noCommonGroups: t(CHAT_KEYS.sidebarInfo.noCommonGroups),
    viewAll: t(CHAT_KEYS.sidebarInfo.viewAll),
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
    createGroup: t(CHAT_KEYS.sidebarInfo.createGroup),
    ownerRole: t(CHAT_KEYS.sidebarInfo.ownerRole),
    adminRole: t(CHAT_KEYS.sidebarInfo.adminRole),
    addDeputy: t(CHAT_KEYS.sidebarInfo.addDeputy),
    removeFromGroup: t(CHAT_KEYS.sidebarInfo.removeFromGroup),
    searchMemberPlaceholder: t(CHAT_KEYS.sidebarInfo.searchMemberPlaceholder),
    membersLoading: t(CHAT_KEYS.sidebarInfo.membersLoading),
    noMatchingMembers: t(CHAT_KEYS.sidebarInfo.noMatchingMembers)
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
