import type { TFunction } from 'i18next'
import { SEARCH_KEYS } from './search.keys'

export const createSearchTexts = (t: TFunction<'search'>) => ({
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
  tabs: {
    all: t(SEARCH_KEYS.tabs.all),
    contacts: t(SEARCH_KEYS.tabs.contacts),
    messages: t(SEARCH_KEYS.tabs.messages),
    file: t(SEARCH_KEYS.tabs.file),
    files: t(SEARCH_KEYS.tabs.files)
  },
  global: {
    title: t(SEARCH_KEYS.global.title),
    placeholder: t(SEARCH_KEYS.global.placeholder),
    close: t(SEARCH_KEYS.global.close),
    tabs: {
      all: t(SEARCH_KEYS.global.tabs.all),
      contacts: t(SEARCH_KEYS.global.tabs.contacts),
      messages: t(SEARCH_KEYS.global.tabs.messages),
      files: t(SEARCH_KEYS.global.tabs.files)
    },
    sections: {
      contacts: t(SEARCH_KEYS.global.sections.contacts),
      messages: t(SEARCH_KEYS.global.sections.messages),
      files: t(SEARCH_KEYS.global.sections.files),
      recent: t(SEARCH_KEYS.global.sections.recent),
      people: t(SEARCH_KEYS.global.sections.people),
      groups: t(SEARCH_KEYS.global.sections.groups)
    },
    actions: {
      viewAll: t(SEARCH_KEYS.global.actions.viewAll),
      viewAllMessages: t(SEARCH_KEYS.global.actions.viewAllMessages),
      viewAllFiles: t(SEARCH_KEYS.global.actions.viewAllFiles),
      viewAllContacts: t(SEARCH_KEYS.global.actions.viewAllContacts),
      viewAllPeople: t(SEARCH_KEYS.global.actions.viewAllPeople),
      viewAllGroups: t(SEARCH_KEYS.global.actions.viewAllGroups),
      clearAll: t(SEARCH_KEYS.global.actions.clearAll)
    },
    filters: {
      label: t(SEARCH_KEYS.global.filters.label),
      sender: t(SEARCH_KEYS.global.filters.sender),
      time: t(SEARCH_KEYS.global.filters.time),
      all: t(SEARCH_KEYS.global.filters.all),
      you: t(SEARCH_KEYS.global.filters.you),
      timeSuggestion: t(SEARCH_KEYS.global.filters.timeSuggestion),
      last7Days: t(SEARCH_KEYS.global.filters.last7Days),
      last30Days: t(SEARCH_KEYS.global.filters.last30Days),
      last3Months: t(SEARCH_KEYS.global.filters.last3Months),
      chooseTimeRange: t(SEARCH_KEYS.global.filters.chooseTimeRange),
      fromDate: t(SEARCH_KEYS.global.filters.fromDate),
      toDate: t(SEARCH_KEYS.global.filters.toDate),
      cancel: t(SEARCH_KEYS.global.filters.cancel),
      confirm: t(SEARCH_KEYS.global.filters.confirm),
      type: t(SEARCH_KEYS.global.filters.type)
    },
    states: {
      empty: t(SEARCH_KEYS.global.states.empty),
      noRecent: t(SEARCH_KEYS.global.states.noRecent),
      loading: t(SEARCH_KEYS.global.states.loading),
      developing: (tab: string) => t(SEARCH_KEYS.global.states.developing, { tab })
    },
    contactTypes: {
      friend: t(SEARCH_KEYS.global.contactTypes.friend),
      members: (count: number) => t(SEARCH_KEYS.global.contactTypes.members, { count })
    },
    resultCard: {
      forward: t(SEARCH_KEYS.global.resultCard.forward),
      jump: t(SEARCH_KEYS.global.resultCard.jump),
      preview: t(SEARCH_KEYS.global.resultCard.preview),
      download: t(SEARCH_KEYS.global.resultCard.download)
    }
  }
})

export type SearchTexts = ReturnType<typeof createSearchTexts>

