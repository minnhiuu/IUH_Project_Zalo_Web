import type { TFunction } from 'i18next'
import { FRIEND_KEYS } from './friend.keys'

export const createFriendTexts = (t: TFunction<'friend'>) => ({
  title: t(FRIEND_KEYS.title),

  sidebar: {
    friendList: t(FRIEND_KEYS.sidebar.friendList),
    groupList: t(FRIEND_KEYS.sidebar.groupList),
    friendRequests: t(FRIEND_KEYS.sidebar.friendRequests),
    groupInvites: t(FRIEND_KEYS.sidebar.groupInvites),
    addFriend: t(FRIEND_KEYS.actions.addFriend)
  },

  header: {
    friendCount: (count: number) => t(FRIEND_KEYS.header.friendCount, { count })
  },

  tabs: {
    received: t(FRIEND_KEYS.tabs.received),
    sent: t(FRIEND_KEYS.tabs.sent)
  },

  actions: {
    accept: t(FRIEND_KEYS.actions.accept),
    decline: t(FRIEND_KEYS.actions.decline),
    withdraw: t(FRIEND_KEYS.actions.withdraw),
    recall: t(FRIEND_KEYS.actions.recall),
    addFriend: t(FRIEND_KEYS.actions.addFriend),
    unfriend: t(FRIEND_KEYS.actions.unfriend),
    cancelRequest: t(FRIEND_KEYS.actions.cancelRequest),
    message: t(FRIEND_KEYS.actions.message),
    call: t(FRIEND_KEYS.actions.call),
    videoCall: t(FRIEND_KEYS.actions.videoCall),
    skip: t(FRIEND_KEYS.actions.skip)
  },

  menu: {
    viewProfile: t(FRIEND_KEYS.menu.viewProfile)
  },

  search: {
    placeholder: t(FRIEND_KEYS.search.placeholder),
    noResult: t(FRIEND_KEYS.search.noResult)
  },

  sort: {
    nameAsc: t(FRIEND_KEYS.sort.nameAsc),
    nameDesc: t(FRIEND_KEYS.sort.nameDesc),
    recent: t(FRIEND_KEYS.sort.recent)
  },

  filter: {
    all: t(FRIEND_KEYS.filter.all),
    newFriends: t(FRIEND_KEYS.filter.newFriends)
  },

  sections: {
    newFriends: t(FRIEND_KEYS.sections.newFriends),
    receivedRequests: (count: number) => t(FRIEND_KEYS.sections.receivedRequests, { count }),
    suggestions: (count: number) => t(FRIEND_KEYS.sections.suggestions, { count })
  },

  source: {
    phoneContact: t(FRIEND_KEYS.source.phoneContact),
    friendSuggestion: t(FRIEND_KEYS.source.friendSuggestion),
    qrCode: t(FRIEND_KEYS.source.qrCode),
    nearby: t(FRIEND_KEYS.source.nearby),
    group: (groupName: string) => t(FRIEND_KEYS.source.group, { groupName }),
    mutualGroups: (count: number) => t(FRIEND_KEYS.source.mutualGroups, { count }),
    mutualFriendsSource: (count: number) => t(FRIEND_KEYS.source.mutualFriendsSource, { count })
  },

  time: {
    justNow: t(FRIEND_KEYS.time.justNow),
    minutesAgo: (count: number) => t(FRIEND_KEYS.time.minutesAgo, { count }),
    hoursAgo: (count: number) => t(FRIEND_KEYS.time.hoursAgo, { count }),
    daysAgo: (count: number) => t(FRIEND_KEYS.time.daysAgo, { count }),
    weeksAgo: (count: number) => t(FRIEND_KEYS.time.weeksAgo, { count })
  },

  empty: {
    received: t(FRIEND_KEYS.empty.received),
    sent: t(FRIEND_KEYS.empty.sent),
    friends: t(FRIEND_KEYS.empty.friends),
    suggestions: t(FRIEND_KEYS.empty.suggestions)
  },

  toast: {
    sendSuccess: t(FRIEND_KEYS.toast.sendSuccess),
    sendError: t(FRIEND_KEYS.toast.sendError),
    acceptSuccess: t(FRIEND_KEYS.toast.acceptSuccess),
    acceptError: t(FRIEND_KEYS.toast.acceptError),
    declineSuccess: t(FRIEND_KEYS.toast.declineSuccess),
    declineError: t(FRIEND_KEYS.toast.declineError),
    cancelSuccess: t(FRIEND_KEYS.toast.cancelSuccess),
    cancelError: t(FRIEND_KEYS.toast.cancelError),
    unfriendSuccess: t(FRIEND_KEYS.toast.unfriendSuccess),
    unfriendError: t(FRIEND_KEYS.toast.unfriendError)
  },

  status: {
    pending: t(FRIEND_KEYS.status.pending),
    accepted: t(FRIEND_KEYS.status.accepted),
    declined: t(FRIEND_KEYS.status.declined),
    cancelled: t(FRIEND_KEYS.status.cancelled),
    notFriend: t(FRIEND_KEYS.status.notFriend)
  },

  comingSoon: {
    title: t(FRIEND_KEYS.comingSoon.title),
    description: t(FRIEND_KEYS.comingSoon.description)
  },

  addFriend: {
    title: t(FRIEND_KEYS.addFriend.title),
    phonePlaceholder: t(FRIEND_KEYS.addFriend.phonePlaceholder),
    recentResults: t(FRIEND_KEYS.addFriend.recentResults),
    cancel: t(FRIEND_KEYS.addFriend.cancel),
    search: t(FRIEND_KEYS.addFriend.search),
    accountInfo: t(FRIEND_KEYS.addFriend.accountInfo),
    defaultMessagePrefix: t(FRIEND_KEYS.addFriend.defaultMessagePrefix),
    messagePlaceholder: t(FRIEND_KEYS.addFriend.messagePlaceholder),
    characters: t(FRIEND_KEYS.addFriend.characters),
    blockDiary: t(FRIEND_KEYS.addFriend.blockDiary),
    viewInfo: t(FRIEND_KEYS.addFriend.viewInfo)
  },

  contactList: {
    title: t(FRIEND_KEYS.contactList.title),
    searchPlaceholder: t(FRIEND_KEYS.contactList.searchPlaceholder),
    sortLabel: t(FRIEND_KEYS.contactList.sortLabel),
    filterLabel: t(FRIEND_KEYS.contactList.filterLabel),
    noFriendsMessage: t(FRIEND_KEYS.contactList.noFriendsMessage)
  },

  dialogs: {
    addFriendConfirm: {
      cancel: t(FRIEND_KEYS.dialogs.addFriendConfirm.cancel)
    },
    addFriendAccept: {
      title: t(FRIEND_KEYS.dialogs.addFriendAccept.title),
      subtitle: t(FRIEND_KEYS.dialogs.addFriendAccept.subtitle),
      cancel: t(FRIEND_KEYS.dialogs.addFriendAccept.cancel),
      confirm: t(FRIEND_KEYS.dialogs.addFriendAccept.confirm)
    },
    addFriendSearch: {
      countryCode: t(FRIEND_KEYS.dialogs.addFriendSearch.countryCode),
      recentResults: t(FRIEND_KEYS.dialogs.addFriendSearch.recentResults),
      noUsersFound: t(FRIEND_KEYS.dialogs.addFriendSearch.noUsersFound),
      emptyState: t(FRIEND_KEYS.dialogs.addFriendSearch.emptyState),
      friendSuggestion: t(FRIEND_KEYS.dialogs.addFriendSearch.friendSuggestion),
      cancel: t(FRIEND_KEYS.dialogs.addFriendSearch.cancel),
      search: t(FRIEND_KEYS.dialogs.addFriendSearch.search)
    },
    unfriendConfirm: {
      title: t(FRIEND_KEYS.dialogs.unfriendConfirm.title),
      description: (userName: string) => t(FRIEND_KEYS.dialogs.unfriendConfirm.description, { userName }),
      cancel: t(FRIEND_KEYS.dialogs.unfriendConfirm.cancel),
      confirm: t(FRIEND_KEYS.dialogs.unfriendConfirm.confirm)
    }
  },

  contacts: {
    searchPlaceholder: t(FRIEND_KEYS.contacts.searchPlaceholder)
  },

  contactsFilter: {
    searchPlaceholder: t(FRIEND_KEYS.contactsFilter.searchPlaceholder),
    filterOptions: {
      all: t(FRIEND_KEYS.contactsFilter.filterOptions.all),
      friends: t(FRIEND_KEYS.contactsFilter.filterOptions.friends),
      requests: t(FRIEND_KEYS.contactsFilter.filterOptions.requests),
      blocked: t(FRIEND_KEYS.contactsFilter.filterOptions.blocked)
    },
    sortOptions: {
      nameAZ: t(FRIEND_KEYS.contactsFilter.sortOptions.nameAZ),
      nameZA: t(FRIEND_KEYS.contactsFilter.sortOptions.nameZA),
      recent: t(FRIEND_KEYS.contactsFilter.sortOptions.recent),
      online: t(FRIEND_KEYS.contactsFilter.sortOptions.online)
    },
    resultsLabel: t(FRIEND_KEYS.contactsFilter.resultsLabel),
    filtersLabel: t(FRIEND_KEYS.contactsFilter.filtersLabel),
    sortLabel: t(FRIEND_KEYS.contactsFilter.sortLabel)
  },

  buttons: {
    cancel: t(FRIEND_KEYS.buttons.cancel),
    confirm: t(FRIEND_KEYS.buttons.confirm)
  },

  requestCard: {
    accept: t(FRIEND_KEYS.requestCard.accept),
    decline: t(FRIEND_KEYS.requestCard.decline),
    sourcePhone: t(FRIEND_KEYS.requestCard.sourcePhone)
  },

  pagination: {
    prev: t(FRIEND_KEYS.pagination.prev),
    next: t(FRIEND_KEYS.pagination.next)
  },

  mutualFriends: (count: number) => t(FRIEND_KEYS.mutualFriends, { count }),
  viewMore: t(FRIEND_KEYS.viewMore),
  loading: t(FRIEND_KEYS.loading),
  error: t(FRIEND_KEYS.error),

  groupList: {
    title: t(FRIEND_KEYS.groupList.title),
    count: (count: number) => t(FRIEND_KEYS.groupList.count, { count }),
    searchPlaceholder: t(FRIEND_KEYS.groupList.searchPlaceholder),
    sortOptions: {
      activityNewest: t(FRIEND_KEYS.groupList.sortOptions.activityNewest),
      activityOldest: t(FRIEND_KEYS.groupList.sortOptions.activityOldest),
      nameAsc: t(FRIEND_KEYS.groupList.sortOptions.nameAsc),
      nameDesc: t(FRIEND_KEYS.groupList.sortOptions.nameDesc)
    },
    filterOptions: {
      all: t(FRIEND_KEYS.groupList.filterOptions.all),
      owner: t(FRIEND_KEYS.groupList.filterOptions.owner)
    },
    memberCount: (count: number) => t(FRIEND_KEYS.groupList.memberCount, { count }),
    noGroups: t(FRIEND_KEYS.groupList.noGroups),
    noResults: t(FRIEND_KEYS.groupList.noResults),
    openChat: t(FRIEND_KEYS.groupList.openChat)
  }
})
