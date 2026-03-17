import type { TFunction } from 'i18next'
import { FRIEND_KEYS } from './friend.keys'

export const createFriendTexts = (t: TFunction<'friend'>) => ({
  title: t(FRIEND_KEYS.title),

  sidebar: {
    friendList: t(FRIEND_KEYS.sidebar.friendList),
    groupList: t(FRIEND_KEYS.sidebar.groupList),
    friendRequests: t(FRIEND_KEYS.sidebar.friendRequests),
    groupInvites: t(FRIEND_KEYS.sidebar.groupInvites)
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
    acceptSuccess: t(FRIEND_KEYS.toast.acceptSuccess),
    declineSuccess: t(FRIEND_KEYS.toast.declineSuccess),
    cancelSuccess: t(FRIEND_KEYS.toast.cancelSuccess),
    unfriendSuccess: t(FRIEND_KEYS.toast.unfriendSuccess)
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

  mutualFriends: (count: number) => t(FRIEND_KEYS.mutualFriends, { count }),
  viewMore: t(FRIEND_KEYS.viewMore),
  loading: t(FRIEND_KEYS.loading),
  error: t(FRIEND_KEYS.error)
})
