export const SEARCH_KEYS = {
  placeholder: 'placeholder',
  close: 'close',
  recentHeader: 'recentHeader',
  noRecent: 'noRecent',
  searchResult: 'searchResult',
  noResult: 'noResult',
  noResultDescription: 'noResultDescription',
  recent: 'recent',
  clearAll: 'clearAll',
  clearHistory: {
    title: 'clearHistory.title',
    confirmMessage: 'clearHistory.confirmMessage',
    cancel: 'clearHistory.cancel',
    confirm: 'clearHistory.confirm'
  },
  findByPhone: 'findByPhone',
  phoneNumber: 'phoneNumber',
  tabs: {
    all: 'tabs.all',
    contacts: 'tabs.contacts',
    messages: 'tabs.messages',
    file: 'tabs.file',
    files: 'tabs.files'
  },
  globalSearch: {
    title: 'globalSearch.title',
    placeholder: 'globalSearch.placeholder',
    close: 'globalSearch.close',
    tabs: {
      all: 'globalSearch.tabs.all',
      contacts: 'globalSearch.tabs.contacts',
      messages: 'globalSearch.tabs.messages',
      files: 'globalSearch.tabs.files'
    },
    sections: {
      contacts: 'globalSearch.sections.contacts',
      messages: 'globalSearch.sections.messages',
      files: 'globalSearch.sections.files',
      recent: 'globalSearch.sections.recent',
      people: 'globalSearch.sections.people',
      groups: 'globalSearch.sections.groups'
    },
    actions: {
      viewAll: 'globalSearch.actions.viewAll',
      viewAllMessages: 'globalSearch.actions.viewAllMessages',
      viewAllFiles: 'globalSearch.actions.viewAllFiles',
      viewAllContacts: 'globalSearch.actions.viewAllContacts',
      viewAllPeople: 'globalSearch.actions.viewAllPeople',
      viewAllGroups: 'globalSearch.actions.viewAllGroups',
      clearAll: 'globalSearch.actions.clearAll'
    },
    filters: {
      label: 'globalSearch.filters.label',
      sender: 'globalSearch.filters.sender',
      time: 'globalSearch.filters.time',
      all: 'globalSearch.filters.all',
      you: 'globalSearch.filters.you',
      timeSuggestion: 'globalSearch.filters.timeSuggestion',
      last7Days: 'globalSearch.filters.last7Days',
      last30Days: 'globalSearch.filters.last30Days',
      last3Months: 'globalSearch.filters.last3Months',
      chooseTimeRange: 'globalSearch.filters.chooseTimeRange',
      fromDate: 'globalSearch.filters.fromDate',
      toDate: 'globalSearch.filters.toDate',
      cancel: 'globalSearch.filters.cancel',
      confirm: 'globalSearch.filters.confirm',
      type: 'globalSearch.filters.type'
    },
    states: {
      empty: 'globalSearch.states.empty',
      noRecent: 'globalSearch.states.noRecent',
      loading: 'globalSearch.states.loading',
      developing: 'globalSearch.states.developing'
    },
    contactTypes: {
      friend: 'globalSearch.contactTypes.friend',
      members: 'globalSearch.contactTypes.members'
    },
    resultCard: {
      forward: 'globalSearch.resultCard.forward',
      jump: 'globalSearch.resultCard.jump',
      preview: 'globalSearch.resultCard.preview',
      download: 'globalSearch.resultCard.download'
    }
  }
} as const
