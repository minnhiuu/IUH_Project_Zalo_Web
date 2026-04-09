export const CHAT_KEYS = {
  title: 'chat.title',
  searchPlaceholder: 'chat.searchPlaceholder',
  emptyState: 'chat.emptyState',
  emptyStateSearch: 'chat.emptyStateSearch',
  inputPlaceholder: 'chat.inputPlaceholder',
  send: 'chat.send',
  loading: 'chat.loading',
  replyingTo: 'chat.replyingTo',
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
  you_lower: 'chat.you_lower',
  user: 'chat.user',
  type: {
    image: 'chat.type.image',
    file: 'chat.type.file'
  },
  systemFriendship: {
    defaultPartnerName: 'chat.systemFriendship.defaultPartnerName',
    acceptedBy: 'chat.systemFriendship.acceptedBy',
    acceptedSuffix: 'chat.systemFriendship.acceptedSuffix',
    becameFriendsWith: 'chat.systemFriendship.becameFriendsWith',
    becameFriendsPrefix: 'chat.systemFriendship.becameFriendsPrefix',
    cardTitle: 'chat.systemFriendship.cardTitle',
    cardDescription: 'chat.systemFriendship.cardDescription',
    sendGreeting: 'chat.systemFriendship.sendGreeting',
    greetingMessage: 'chat.systemFriendship.greetingMessage'
  },
  aiStatus: {
    ANALYZING_INTENT: 'ai.status.ANALYZING_INTENT',
    RETRIEVING_VECTOR: 'ai.status.RETRIEVING_VECTOR',
    GRADING_DATA: 'ai.status.GRADING_DATA',
    WEB_SEARCHING: 'ai.status.WEB_SEARCHING',
    GENERATING_ANSWER: 'ai.status.GENERATING_ANSWER',
    DEFAULT: 'ai.status.DEFAULT'
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
    andOthers: 'chat.create-group-dialog.andOthers',
    updateAvatarTitle: 'chat.create-group-dialog.updateAvatarTitle',
    confirm: 'chat.create-group-dialog.confirm',
    dragToMove: 'chat.create-group-dialog.dragToMove',
    changeAvatar: 'chat.create-group-dialog.changeAvatar',
    removeAvatar: 'chat.create-group-dialog.removeAvatar',
    addMembersTitle: 'chat.create-group-dialog.addMembersTitle',
    alreadyJoined: 'chat.create-group-dialog.alreadyJoined'
  },
  system: {
    add_members: {
      single_self: 'chat.system.add_members.single_self',
      many_self: 'chat.system.add_members.many_self',
      many_self_count: 'chat.system.add_members.many_self_count',
      single_other: 'chat.system.add_members.single_other',
      many_other: 'chat.system.add_members.many_other',
      many_other_count: 'chat.system.add_members.many_other_count',
      group_created: 'chat.system.add_members.group_created',
      joined_group: 'chat.system.add_members.joined_group',
      update_name: 'chat.system.add_members.update_name',
      update_name_simple: 'chat.system.add_members.update_name_simple',
      update_avatar: 'chat.system.add_members.update_avatar',
      update_avatar_simple: 'chat.system.add_members.update_avatar_simple',
      disband_group: 'chat.system.add_members.disband_group'
    },
    remove_member: {
      by_you: 'chat.system.remove_member.by_you',
      self_removed: 'chat.system.remove_member.self_removed',
      by_actor: 'chat.system.remove_member.by_actor'
    },
    leave_group: {
      self: 'chat.system.leave_group.self',
      by_actor: 'chat.system.leave_group.by_actor'
    }
  },
  disbanded: {
    message: 'chat.disbanded.message',
    cannotSendMessage: 'chat.disbanded.cannotSendMessage',
    deleteAction: 'chat.disbanded.deleteAction'
  },
  'rename-group-dialog': {
    title: 'chat.rename-group-dialog.title',
    description: 'chat.rename-group-dialog.description',
    placeholder: 'chat.rename-group-dialog.placeholder',
    cancel: 'chat.rename-group-dialog.cancel',
    confirm: 'chat.rename-group-dialog.confirm'
  },
  'group-info-dialog': {
    title: 'chat.group-info-dialog.title',
    managementTitle: 'chat.group-info-dialog.managementTitle',
    backToInfo: 'chat.group-info-dialog.backToInfo',
    members: 'chat.group-info-dialog.members',
    management: 'chat.group-info-dialog.management',
    leaveGroup: 'chat.group-info-dialog.leaveGroup',
    viewAll: 'chat.group-info-dialog.viewAll',
    media: 'chat.group-info-dialog.media',
    noMedia: 'chat.group-info-dialog.noMedia',
    sendMessage: 'chat.group-info-dialog.sendMessage',
    groupLink: 'chat.group-info-dialog.groupLink',
    memberPermissionsTitle: 'chat.group-info-dialog.memberPermissionsTitle',
    permissions: {
      updateNameAvatar: 'chat.group-info-dialog.permissions.updateNameAvatar',
      pinNotePoll: 'chat.group-info-dialog.permissions.pinNotePoll',
      createReminder: 'chat.group-info-dialog.permissions.createReminder',
      createPoll: 'chat.group-info-dialog.permissions.createPoll',
      sendMessage: 'chat.group-info-dialog.permissions.sendMessage'
    },
    toggles: {
      reviewNewMembers: 'chat.group-info-dialog.toggles.reviewNewMembers',
      highlightAdminMessages: 'chat.group-info-dialog.toggles.highlightAdminMessages',
      allowNewMembersReadRecent: 'chat.group-info-dialog.toggles.allowNewMembersReadRecent',
      allowJoinByLink: 'chat.group-info-dialog.toggles.allowJoinByLink'
    },
    toggleTooltips: {
      reviewNewMembers: 'chat.group-info-dialog.toggleTooltips.reviewNewMembers',
      highlightAdminMessages: 'chat.group-info-dialog.toggleTooltips.highlightAdminMessages',
      allowNewMembersReadRecent: 'chat.group-info-dialog.toggleTooltips.allowNewMembersReadRecent',
      allowJoinByLink: 'chat.group-info-dialog.toggleTooltips.allowJoinByLink'
    },
    actions: {
      removeMembers: 'chat.group-info-dialog.actions.removeMembers',
      ownerAndDeputy: 'chat.group-info-dialog.actions.ownerAndDeputy',
      disbandGroup: 'chat.group-info-dialog.actions.disbandGroup',
      disbandDialog: {
        title: 'chat.group-info-dialog.actions.disbandDialog.title',
        description: 'chat.group-info-dialog.actions.disbandDialog.description',
        confirm: 'chat.group-info-dialog.actions.disbandDialog.confirm',
        cancel: 'chat.group-info-dialog.actions.disbandDialog.cancel'
      },
      leaveDialog: {
        title: 'chat.group-info-dialog.actions.leaveDialog.title',
        description: 'chat.group-info-dialog.actions.leaveDialog.description',
        silentTitle: 'chat.group-info-dialog.actions.leaveDialog.silentTitle',
        silentDescription: 'chat.group-info-dialog.actions.leaveDialog.silentDescription',
        confirm: 'chat.group-info-dialog.actions.leaveDialog.confirm',
        cancel: 'chat.group-info-dialog.actions.leaveDialog.cancel'
      },
      transferOwnerDialog: {
        title: 'chat.group-info-dialog.actions.transferOwnerDialog.title',
        description: 'chat.group-info-dialog.actions.transferOwnerDialog.description',
        confirm: 'chat.group-info-dialog.actions.transferOwnerDialog.confirm',
        cancel: 'chat.group-info-dialog.actions.transferOwnerDialog.cancel',
        searchPlaceholder: 'chat.group-info-dialog.actions.transferOwnerDialog.searchPlaceholder'
      }
    }
  },
  toasts: {
    updating: 'chat.toasts.updating',
    updateAvatarSuccess: 'chat.toasts.updateAvatarSuccess',
    updateNameSuccess: 'chat.toasts.updateNameSuccess',
    updateError: 'chat.toasts.updateError',
    leaveGroupSuccess: 'chat.toasts.leaveGroupSuccess',
    leaveGroupError: 'chat.toasts.leaveGroupError'
  },
  sidebarInfo: {
    title: 'chat.sidebarInfo.title',
    groupTitle: 'chat.sidebarInfo.groupTitle',
    members: 'chat.sidebarInfo.members',
    groupBoard: 'chat.sidebarInfo.groupBoard',
    reminderBoard: 'chat.sidebarInfo.reminderBoard',
    notesPinsPolls: 'chat.sidebarInfo.notesPinsPolls',
    commonGroups: 'chat.sidebarInfo.commonGroups',
    commonGroupsCount: 'chat.sidebarInfo.commonGroupsCount',
    noCommonGroups: 'chat.sidebarInfo.noCommonGroups',
    viewAll: 'chat.sidebarInfo.viewAll',
    photosVideos: 'chat.sidebarInfo.photosVideos',
    noPhotosVideos: 'chat.sidebarInfo.noPhotosVideos',
    files: 'chat.sidebarInfo.files',
    noFiles: 'chat.sidebarInfo.noFiles',
    links: 'chat.sidebarInfo.links',
    noLinks: 'chat.sidebarInfo.noLinks',
    privacySettings: 'chat.sidebarInfo.privacySettings',
    disappearingMessages: 'chat.sidebarInfo.disappearingMessages',
    disappearingMessagesTooltip: 'chat.sidebarInfo.disappearingMessagesTooltip',
    disappearingMessagesWarning: 'chat.sidebarInfo.disappearingMessagesWarning',
    never: 'chat.sidebarInfo.never',
    hideConversation: 'chat.sidebarInfo.hideConversation',
    reportAction: 'chat.sidebarInfo.reportAction',
    deleteHistory: 'chat.sidebarInfo.deleteHistory',
    leaveGroup: 'chat.sidebarInfo.leaveGroup',
    viewAllMembers: 'chat.sidebarInfo.viewAllMembers',
    muteNotifications: 'chat.sidebarInfo.muteNotifications',
    pin: 'chat.sidebarInfo.pin',
    addMember: 'chat.sidebarInfo.addMember',
    settings: 'chat.sidebarInfo.settings',
    createGroup: 'chat.sidebarInfo.createGroup',
    ownerRole: 'chat.sidebarInfo.ownerRole',
    adminRole: 'chat.sidebarInfo.adminRole',
    addDeputy: 'chat.sidebarInfo.addDeputy',
    removeFromGroup: 'chat.sidebarInfo.removeFromGroup',
    searchMemberPlaceholder: 'chat.sidebarInfo.searchMemberPlaceholder',
    membersLoading: 'chat.sidebarInfo.membersLoading',
    noMatchingMembers: 'chat.sidebarInfo.noMatchingMembers'
  }
} as const
