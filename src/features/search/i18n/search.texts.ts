import type { TFunction } from 'i18next'
import { SEARCH_KEYS } from './search.keys'

export const createSearchTexts = (t: TFunction<'globalSearch'>) => ({
  placeholder: t(SEARCH_KEYS.placeholder),
  close: t(SEARCH_KEYS.close),
  recentHeader: t(SEARCH_KEYS.recentHeader),
  noRecent: t(SEARCH_KEYS.noRecent),
  searchResult: (query: string) => t(SEARCH_KEYS.searchResult, { query }),
  noResult: t(SEARCH_KEYS.noResult),
  noResultDescription: t(SEARCH_KEYS.noResultDescription),
  recent: t(SEARCH_KEYS.recent),
  clearAll: t(SEARCH_KEYS.clearAll),
  clearHistory: {
    title: t(SEARCH_KEYS.clearHistory.title),
    confirmMessage: t(SEARCH_KEYS.clearHistory.confirmMessage),
    cancel: t(SEARCH_KEYS.clearHistory.cancel),
    confirm: t(SEARCH_KEYS.clearHistory.confirm)
  },
  findByPhone: t(SEARCH_KEYS.findByPhone),
  phoneNumber: t(SEARCH_KEYS.phoneNumber),
  loadMore: t(SEARCH_KEYS.loadMore),
  relationship: {
    mutualFriends: (count: number) => t(SEARCH_KEYS.relationship.mutualFriends, { count }),
    sharedGroups: (count: number) => t(SEARCH_KEYS.relationship.sharedGroups, { count }),
    inContact: t(SEARCH_KEYS.relationship.inContact)
  },
  tabs: {
    all: t(SEARCH_KEYS.tabs.all),
    contacts: t(SEARCH_KEYS.tabs.contacts),
    messages: t(SEARCH_KEYS.tabs.messages),
    file: t(SEARCH_KEYS.tabs.file),
    files: t(SEARCH_KEYS.tabs.files)
  },
  globalSearch: {
    title: t(SEARCH_KEYS.globalSearch.title),
    placeholder: t(SEARCH_KEYS.globalSearch.placeholder),
    close: t(SEARCH_KEYS.globalSearch.close),
    tabs: {
      all: t(SEARCH_KEYS.globalSearch.tabs.all),
      contacts: t(SEARCH_KEYS.globalSearch.tabs.contacts),
      messages: t(SEARCH_KEYS.globalSearch.tabs.messages),
      files: t(SEARCH_KEYS.globalSearch.tabs.files)
    },
    sections: {
      contacts: t(SEARCH_KEYS.globalSearch.sections.contacts),
      messages: t(SEARCH_KEYS.globalSearch.sections.messages),
      files: t(SEARCH_KEYS.globalSearch.sections.files),
      recent: t(SEARCH_KEYS.globalSearch.sections.recent),
      people: t(SEARCH_KEYS.globalSearch.sections.people),
      groups: t(SEARCH_KEYS.globalSearch.sections.groups)
    },
    actions: {
      viewAll: t(SEARCH_KEYS.globalSearch.actions.viewAll),
      viewAllMessages: t(SEARCH_KEYS.globalSearch.actions.viewAllMessages),
      viewAllFiles: t(SEARCH_KEYS.globalSearch.actions.viewAllFiles),
      viewAllContacts: t(SEARCH_KEYS.globalSearch.actions.viewAllContacts),
      viewAllPeople: t(SEARCH_KEYS.globalSearch.actions.viewAllPeople),
      viewAllGroups: t(SEARCH_KEYS.globalSearch.actions.viewAllGroups),
      clearAll: t(SEARCH_KEYS.globalSearch.actions.clearAll)
    },
    filters: {
      label: t(SEARCH_KEYS.globalSearch.filters.label),
      sender: t(SEARCH_KEYS.globalSearch.filters.sender),
      time: t(SEARCH_KEYS.globalSearch.filters.time),
      all: t(SEARCH_KEYS.globalSearch.filters.all),
      you: t(SEARCH_KEYS.globalSearch.filters.you),
      timeSuggestion: t(SEARCH_KEYS.globalSearch.filters.timeSuggestion),
      last7Days: t(SEARCH_KEYS.globalSearch.filters.last7Days),
      last30Days: t(SEARCH_KEYS.globalSearch.filters.last30Days),
      last3Months: t(SEARCH_KEYS.globalSearch.filters.last3Months),
      chooseTimeRange: t(SEARCH_KEYS.globalSearch.filters.chooseTimeRange),
      fromDate: t(SEARCH_KEYS.globalSearch.filters.fromDate),
      toDate: t(SEARCH_KEYS.globalSearch.filters.toDate),
      cancel: t(SEARCH_KEYS.globalSearch.filters.cancel),
      confirm: t(SEARCH_KEYS.globalSearch.filters.confirm),
      type: t(SEARCH_KEYS.globalSearch.filters.type)
    },
    states: {
      empty: t(SEARCH_KEYS.globalSearch.states.empty),
      noRecent: t(SEARCH_KEYS.globalSearch.states.noRecent),
      loading: t(SEARCH_KEYS.globalSearch.states.loading),
      developing: (tab: string) => t(SEARCH_KEYS.globalSearch.states.developing, { tab })
    },
    contactTypes: {
      friend: t(SEARCH_KEYS.globalSearch.contactTypes.friend),
      members: (count: number) => t(SEARCH_KEYS.globalSearch.contactTypes.members, { count })
    },
    resultCard: {
      forward: t(SEARCH_KEYS.globalSearch.resultCard.forward),
      jump: t(SEARCH_KEYS.globalSearch.resultCard.jump),
      preview: t(SEARCH_KEYS.globalSearch.resultCard.preview),
      download: t(SEARCH_KEYS.globalSearch.resultCard.download)
    }
  }
})

export type SearchTexts = ReturnType<typeof createSearchTexts>
