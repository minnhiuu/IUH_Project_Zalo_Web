import type { TFunction } from 'i18next'
import { GLOBAL_SEARCH_KEYS } from './global-search.keys'

export const createGlobalSearchTexts = (t: TFunction<'globalSearch'>) => ({
  title: t(GLOBAL_SEARCH_KEYS.title),
  placeholder: t(GLOBAL_SEARCH_KEYS.placeholder),
  close: t(GLOBAL_SEARCH_KEYS.close),
  tabs: {
    all: t(GLOBAL_SEARCH_KEYS.tabs.all),
    contacts: t(GLOBAL_SEARCH_KEYS.tabs.contacts),
    messages: t(GLOBAL_SEARCH_KEYS.tabs.messages),
    files: t(GLOBAL_SEARCH_KEYS.tabs.files)
  },
  sections: {
    contacts: t(GLOBAL_SEARCH_KEYS.sections.contacts),
    messages: t(GLOBAL_SEARCH_KEYS.sections.messages),
    files: t(GLOBAL_SEARCH_KEYS.sections.files),
    recent: t(GLOBAL_SEARCH_KEYS.sections.recent),
    people: t(GLOBAL_SEARCH_KEYS.sections.people),
    groups: t(GLOBAL_SEARCH_KEYS.sections.groups)
  },
  actions: {
    viewAll: t(GLOBAL_SEARCH_KEYS.actions.viewAll),
    viewAllMessages: t(GLOBAL_SEARCH_KEYS.actions.viewAllMessages),
    viewAllFiles: t(GLOBAL_SEARCH_KEYS.actions.viewAllFiles),
    viewAllContacts: t(GLOBAL_SEARCH_KEYS.actions.viewAllContacts),
    viewAllPeople: t(GLOBAL_SEARCH_KEYS.actions.viewAllPeople),
    viewAllGroups: t(GLOBAL_SEARCH_KEYS.actions.viewAllGroups),
    clearAll: t(GLOBAL_SEARCH_KEYS.actions.clearAll)
  },
  states: {
    empty: t(GLOBAL_SEARCH_KEYS.states.empty),
    noRecent: t(GLOBAL_SEARCH_KEYS.states.noRecent),
    loading: t(GLOBAL_SEARCH_KEYS.states.loading),
    developing: (tab: string) => t(GLOBAL_SEARCH_KEYS.states.developing, { tab })
  },
  contactTypes: {
    friend: t(GLOBAL_SEARCH_KEYS.contactTypes.friend),
    members: (count: number) => t(GLOBAL_SEARCH_KEYS.contactTypes.members, { count })
  }
})
