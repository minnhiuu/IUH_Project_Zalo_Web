export const ADMIN_KEYS = {
  userManagement: {
    title: 'userManagement.title',
    description: 'userManagement.description',
    active: 'userManagement.active',
    banned: 'userManagement.banned',

    table: {
      no: 'userManagement.table.no',
      userName: 'userManagement.table.userName',
      email: 'userManagement.table.email',
      phone: 'userManagement.table.phone',
      role: 'userManagement.table.role',
      status: 'userManagement.table.status',
      createdAt: 'userManagement.table.createdAt',
      lastLogin: 'userManagement.table.lastLogin',
      actions: 'userManagement.table.actions',
      noData: 'userManagement.table.noData'
    },

    pagination: {
      previous: 'userManagement.pagination.previous',
      next: 'userManagement.pagination.next',
      pageOf: 'userManagement.pagination.pageOf'
    },

    actions: {
      view: 'userManagement.actions.view',
      ban: 'userManagement.actions.ban',
      unban: 'userManagement.actions.unban'
    },

    tabs: {
      active: 'userManagement.tabs.active',
      banned: 'userManagement.tabs.banned'
    },

    filters: {
      name: 'userManagement.filters.name',
      namePlaceholder: 'userManagement.filters.namePlaceholder',
      phone: 'userManagement.filters.phone',
      phonePlaceholder: 'userManagement.filters.phonePlaceholder',
      email: 'userManagement.filters.email',
      emailPlaceholder: 'userManagement.filters.emailPlaceholder',
      search: 'userManagement.filters.search',
      reset: 'userManagement.filters.reset'
    },

    banDialog: {
      title: 'userManagement.banDialog.title',
      description: 'userManagement.banDialog.description',
      reason: 'userManagement.banDialog.reason',
      reasonRequired: 'userManagement.banDialog.reasonRequired',
      reasonPlaceholder: 'userManagement.banDialog.reasonPlaceholder',
      cancel: 'userManagement.banDialog.cancel',
      confirm: 'userManagement.banDialog.confirm',
      success: 'userManagement.banDialog.success',
      error: 'userManagement.banDialog.error'
    },

    unbanDialog: {
      title: 'userManagement.unbanDialog.title',
      description: 'userManagement.unbanDialog.description',
      cancel: 'userManagement.unbanDialog.cancel',
      confirm: 'userManagement.unbanDialog.confirm',
      success: 'userManagement.unbanDialog.success',
      error: 'userManagement.unbanDialog.error'
    },

    viewDialog: {
      title: 'userManagement.viewDialog.title',
      contactInfo: 'userManagement.viewDialog.contactInfo',
      accountHistory: 'userManagement.viewDialog.accountHistory',
      banInfo: 'userManagement.viewDialog.banInfo',
      email: 'userManagement.viewDialog.email',
      phone: 'userManagement.viewDialog.phone',
      dob: 'userManagement.viewDialog.dob',
      gender: 'userManagement.viewDialog.gender',
      male: 'userManagement.viewDialog.male',
      female: 'userManagement.viewDialog.female',
      createdAt: 'userManagement.viewDialog.createdAt',
      updatedAt: 'userManagement.viewDialog.updatedAt',
      lastLogin: 'userManagement.viewDialog.lastLogin',
      userId: 'userManagement.viewDialog.userId',
      banReason: 'userManagement.viewDialog.banReason',
      verified: 'userManagement.viewDialog.verified'
    }
  }
} as const
