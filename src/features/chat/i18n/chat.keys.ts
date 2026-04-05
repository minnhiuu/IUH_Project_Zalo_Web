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
  you_lower: 'chat.you_lower',
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
    andOthers: 'chat.create-group-dialog.andOthers',
    updateAvatarTitle: 'chat.create-group-dialog.updateAvatarTitle',
    confirm: 'chat.create-group-dialog.confirm',
    dragToMove: 'chat.create-group-dialog.dragToMove',
    changeAvatar: 'chat.create-group-dialog.changeAvatar',
    removeAvatar: 'chat.create-group-dialog.removeAvatar'
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
      update_avatar_simple: 'chat.system.add_members.update_avatar_simple'
    }
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
    members: 'chat.group-info-dialog.members',
    management: 'chat.group-info-dialog.management',
    leaveGroup: 'chat.group-info-dialog.leaveGroup',
    viewAll: 'chat.group-info-dialog.viewAll',
    media: 'chat.group-info-dialog.media',
    noMedia: 'chat.group-info-dialog.noMedia',
    sendMessage: 'chat.group-info-dialog.sendMessage',
    groupLink: 'chat.group-info-dialog.groupLink'
  },
  toasts: {
    updating: 'chat.toasts.updating',
    updateAvatarSuccess: 'chat.toasts.updateAvatarSuccess',
    updateNameSuccess: 'chat.toasts.updateNameSuccess',
    updateError: 'chat.toasts.updateError',
    leaveGroupSuccess: 'chat.toasts.leaveGroupSuccess',
    leaveGroupError: 'chat.toasts.leaveGroupError'
  }
} as const
