export const ADMIN_KEYS = {
  userManagement: {
    title: 'admin.userManagement.title',
    description: 'admin.userManagement.description',
    active: 'admin.userManagement.active',
    banned: 'admin.userManagement.banned',

    table: {
      no: 'admin.userManagement.table.no',
      userName: 'admin.userManagement.table.userName',
      email: 'admin.userManagement.table.email',
      phone: 'admin.userManagement.table.phone',
      role: 'admin.userManagement.table.role',
      status: 'admin.userManagement.table.status',
      createdAt: 'admin.userManagement.table.createdAt',
      lastLogin: 'admin.userManagement.table.lastLogin',
      actions: 'admin.userManagement.table.actions',
      noData: 'admin.userManagement.table.noData'
    },

    pagination: {
      previous: 'admin.userManagement.pagination.previous',
      next: 'admin.userManagement.pagination.next',
      pageOf: 'admin.userManagement.pagination.pageOf'
    },

    actions: {
      view: 'admin.userManagement.actions.view',
      ban: 'admin.userManagement.actions.ban',
      unban: 'admin.userManagement.actions.unban'
    },

    tabs: {
      active: 'admin.userManagement.tabs.active',
      banned: 'admin.userManagement.tabs.banned'
    },

    filters: {
      name: 'admin.userManagement.filters.name',
      namePlaceholder: 'admin.userManagement.filters.namePlaceholder',
      phone: 'admin.userManagement.filters.phone',
      phonePlaceholder: 'admin.userManagement.filters.phonePlaceholder',
      email: 'admin.userManagement.filters.email',
      emailPlaceholder: 'admin.userManagement.filters.emailPlaceholder',
      search: 'admin.userManagement.filters.search',
      reset: 'admin.userManagement.filters.reset'
    },

    banDialog: {
      title: 'admin.userManagement.banDialog.title',
      description: 'admin.userManagement.banDialog.description',
      reason: 'admin.userManagement.banDialog.reason',
      reasonRequired: 'admin.userManagement.banDialog.reasonRequired',
      reasonPlaceholder: 'admin.userManagement.banDialog.reasonPlaceholder',
      cancel: 'admin.userManagement.banDialog.cancel',
      confirm: 'admin.userManagement.banDialog.confirm',
      success: 'admin.userManagement.banDialog.success',
      error: 'admin.userManagement.banDialog.error'
    },

    unbanDialog: {
      title: 'admin.userManagement.unbanDialog.title',
      description: 'admin.userManagement.unbanDialog.description',
      cancel: 'admin.userManagement.unbanDialog.cancel',
      confirm: 'admin.userManagement.unbanDialog.confirm',
      success: 'admin.userManagement.unbanDialog.success',
      error: 'admin.userManagement.unbanDialog.error'
    },

    viewDialog: {
      title: 'admin.userManagement.viewDialog.title',
      contactInfo: 'admin.userManagement.viewDialog.contactInfo',
      accountHistory: 'admin.userManagement.viewDialog.accountHistory',
      banInfo: 'admin.userManagement.viewDialog.banInfo',
      email: 'admin.userManagement.viewDialog.email',
      phone: 'admin.userManagement.viewDialog.phone',
      dob: 'admin.userManagement.viewDialog.dob',
      gender: 'admin.userManagement.viewDialog.gender',
      male: 'admin.userManagement.viewDialog.male',
      female: 'admin.userManagement.viewDialog.female',
      createdAt: 'admin.userManagement.viewDialog.createdAt',
      updatedAt: 'admin.userManagement.viewDialog.updatedAt',
      lastLogin: 'admin.userManagement.viewDialog.lastLogin',
      userId: 'admin.userManagement.viewDialog.userId',
      banReason: 'admin.userManagement.viewDialog.banReason',
      verified: 'admin.userManagement.viewDialog.verified'
    }
  }
} as const
