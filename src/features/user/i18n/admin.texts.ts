import type { TFunction } from 'i18next'
import { ADMIN_KEYS } from './admin.keys'

export const createAdminTexts = (t: TFunction<'admin'>) => ({
  userManagement: {
    title: t(ADMIN_KEYS.userManagement.title),
    description: t(ADMIN_KEYS.userManagement.description),
    active: t(ADMIN_KEYS.userManagement.active),
    banned: t(ADMIN_KEYS.userManagement.banned),

    table: {
      no: t(ADMIN_KEYS.userManagement.table.no),
      userName: t(ADMIN_KEYS.userManagement.table.userName),
      email: t(ADMIN_KEYS.userManagement.table.email),
      phone: t(ADMIN_KEYS.userManagement.table.phone),
      role: t(ADMIN_KEYS.userManagement.table.role),
      status: t(ADMIN_KEYS.userManagement.table.status),
      createdAt: t(ADMIN_KEYS.userManagement.table.createdAt),
      lastLogin: t(ADMIN_KEYS.userManagement.table.lastLogin),
      actions: t(ADMIN_KEYS.userManagement.table.actions),
      noData: t(ADMIN_KEYS.userManagement.table.noData)
    },

    pagination: {
      previous: t(ADMIN_KEYS.userManagement.pagination.previous),
      next: t(ADMIN_KEYS.userManagement.pagination.next),
      pageOf: (current: number, total: number) => t(ADMIN_KEYS.userManagement.pagination.pageOf, { current, total })
    },

    actions: {
      view: t(ADMIN_KEYS.userManagement.actions.view),
      ban: t(ADMIN_KEYS.userManagement.actions.ban),
      unban: t(ADMIN_KEYS.userManagement.actions.unban)
    },

    tabs: {
      active: t(ADMIN_KEYS.userManagement.tabs.active),
      banned: t(ADMIN_KEYS.userManagement.tabs.banned)
    },

    filters: {
      name: t(ADMIN_KEYS.userManagement.filters.name),
      namePlaceholder: t(ADMIN_KEYS.userManagement.filters.namePlaceholder),
      phone: t(ADMIN_KEYS.userManagement.filters.phone),
      phonePlaceholder: t(ADMIN_KEYS.userManagement.filters.phonePlaceholder),
      email: t(ADMIN_KEYS.userManagement.filters.email),
      emailPlaceholder: t(ADMIN_KEYS.userManagement.filters.emailPlaceholder),
      search: t(ADMIN_KEYS.userManagement.filters.search),
      reset: t(ADMIN_KEYS.userManagement.filters.reset)
    },

    banDialog: {
      title: t(ADMIN_KEYS.userManagement.banDialog.title),
      description: t(ADMIN_KEYS.userManagement.banDialog.description),
      reason: t(ADMIN_KEYS.userManagement.banDialog.reason),
      reasonRequired: t(ADMIN_KEYS.userManagement.banDialog.reasonRequired),
      reasonPlaceholder: t(ADMIN_KEYS.userManagement.banDialog.reasonPlaceholder),
      cancel: t(ADMIN_KEYS.userManagement.banDialog.cancel),
      confirm: t(ADMIN_KEYS.userManagement.banDialog.confirm),
      success: (name: string) => t(ADMIN_KEYS.userManagement.banDialog.success, { name }),
      error: t(ADMIN_KEYS.userManagement.banDialog.error)
    },

    unbanDialog: {
      title: t(ADMIN_KEYS.userManagement.unbanDialog.title),
      description: t(ADMIN_KEYS.userManagement.unbanDialog.description),
      cancel: t(ADMIN_KEYS.userManagement.unbanDialog.cancel),
      confirm: t(ADMIN_KEYS.userManagement.unbanDialog.confirm),
      success: (name: string) => t(ADMIN_KEYS.userManagement.unbanDialog.success, { name }),
      error: t(ADMIN_KEYS.userManagement.unbanDialog.error)
    },

    viewDialog: {
      title: t(ADMIN_KEYS.userManagement.viewDialog.title),
      contactInfo: t(ADMIN_KEYS.userManagement.viewDialog.contactInfo),
      accountHistory: t(ADMIN_KEYS.userManagement.viewDialog.accountHistory),
      banInfo: t(ADMIN_KEYS.userManagement.viewDialog.banInfo),
      email: t(ADMIN_KEYS.userManagement.viewDialog.email),
      phone: t(ADMIN_KEYS.userManagement.viewDialog.phone),
      dob: t(ADMIN_KEYS.userManagement.viewDialog.dob),
      gender: t(ADMIN_KEYS.userManagement.viewDialog.gender),
      male: t(ADMIN_KEYS.userManagement.viewDialog.male),
      female: t(ADMIN_KEYS.userManagement.viewDialog.female),
      createdAt: t(ADMIN_KEYS.userManagement.viewDialog.createdAt),
      updatedAt: t(ADMIN_KEYS.userManagement.viewDialog.updatedAt),
      lastLogin: t(ADMIN_KEYS.userManagement.viewDialog.lastLogin),
      userId: t(ADMIN_KEYS.userManagement.viewDialog.userId),
      banReason: t(ADMIN_KEYS.userManagement.viewDialog.banReason),
      verified: t(ADMIN_KEYS.userManagement.viewDialog.verified)
    }
  }
})
