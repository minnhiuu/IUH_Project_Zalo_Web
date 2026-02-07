export const USER_KEYS = {
  menu: {
    profile: 'user.menu.profile',
    settings: 'user.menu.settings',
    language: 'user.menu.language',
    appearance: 'user.menu.appearance',
    themeLight: 'user.menu.themeLight',
    themeDark: 'user.menu.themeDark',
    themeSystem: 'user.menu.themeSystem',
    logout: 'user.menu.logout'
  },
  profile: {
    title: 'user.profile.title',
    personalInfo: 'user.profile.personalInfo',
    gender: 'user.profile.gender',
    dob: 'user.profile.dob',
    phone: 'user.profile.phone',
    update: 'user.profile.update',
    privacyNote: 'user.profile.privacyNote',
    male: 'user.profile.male',
    female: 'user.profile.female',
    editTitle: 'user.profile.editTitle',
    fullNameLabel: 'user.profile.fullNameLabel',
    fullNamePlaceholder: 'user.profile.fullNamePlaceholder',
    fullNameNote: 'user.profile.fullNameNote',
    day: 'user.profile.day',
    month: 'user.profile.month',
    year: 'user.profile.year',
    cancel: 'user.profile.cancel',
    confirm: 'user.profile.confirm',
    edit: 'user.profile.edit',
    updating: 'user.profile.updating',
    bioLabel: 'user.profile.bioLabel',
    bioPlaceholder: 'user.profile.bioPlaceholder',
    bio: 'user.profile.bio',
    noBio: 'user.profile.noBio',
    selectImageError: 'user.profile.selectImageError',
    updateAvatarSuccess: 'user.profile.updateAvatarSuccess',
    updateBackgroundSuccess: 'user.profile.updateBackgroundSuccess',
    updateAvatarTitle: 'user.profile.updateAvatarTitle',
    updateBackgroundTitle: 'user.profile.updateBackgroundTitle',
    dragToMove: 'user.profile.dragToMove',
    editCover: 'user.profile.editCover',
    addPhoto: 'user.profile.addPhoto',
    uploadPhoto: 'user.profile.uploadPhoto',
    repositionPhoto: 'user.profile.repositionPhoto',
    addFriend: 'user.profile.addFriend',
    message: 'user.profile.message',
    images: 'user.profile.images',
    noImages: 'user.profile.noImages',
    mutualGroups: 'user.profile.mutualGroups',
    shareContact: 'user.profile.shareContact',
    block: 'user.profile.block',
    report: 'user.profile.report',
    deleteFriend: 'user.profile.deleteFriend'
  },
  validation: {
    fullNameRequired: 'user.validation.fullNameRequired',
    dobInvalid: 'user.validation.dobInvalid',
    genderRequired: 'user.validation.genderRequired',
    bioTooLong: 'user.validation.bioTooLong'
  },
  settings: {
    title: 'user.settings.title',
    menu: {
      general: 'user.settings.menu.general',
      security: 'user.settings.menu.security',
      privacy: 'user.settings.menu.privacy',
      sync: 'user.settings.menu.sync',
      appearance: 'user.settings.menu.appearance',
      messages: 'user.settings.menu.messages',
      utilities: 'user.settings.menu.utilities',
      accountPrivacy: 'user.settings.menu.accountPrivacy'
    },
    general: {
      title: 'user.settings.general.title',
      showAllFriends: {
        title: 'user.settings.general.showAllFriends.title',
        description: 'user.settings.general.showAllFriends.description',
        all: 'user.settings.general.showAllFriends.all',
        onlyBondhub: 'user.settings.general.showAllFriends.onlyBondhub'
      },
      language: {
        title: 'user.settings.general.language.title',
        description: 'user.settings.general.language.description',
        english: 'user.settings.general.language.english',
        vietnamese: 'user.settings.general.language.vietnamese'
      }
    },
    security: {
      title: 'user.settings.security.title',
      twoFactor: {
        title: 'user.settings.security.twoFactor.title',
        description: 'user.settings.security.twoFactor.description'
      }
    },
    privacy: {
      title: 'user.settings.privacy.title',
      personal: {
        title: 'user.settings.privacy.personal.title',
        showDob: {
          title: 'user.settings.privacy.personal.showDob.title',
          description: 'user.settings.privacy.personal.showDob.description',
          hidden: 'user.settings.privacy.personal.showDob.hidden',
          fullDate: 'user.settings.privacy.personal.showDob.fullDate',
          monthDayOnly: 'user.settings.privacy.personal.showDob.monthDayOnly'
        },
        showActiveStatus: {
          title: 'user.settings.privacy.personal.showActiveStatus.title',
          description: 'user.settings.privacy.personal.showActiveStatus.description'
        }
      },
      textAndCall: {
        title: 'user.settings.privacy.textAndCall.title',
        showReadStatus: {
          title: 'user.settings.privacy.textAndCall.showReadStatus.title',
          description: 'user.settings.privacy.textAndCall.showReadStatus.description'
        },
        canText: {
          title: 'user.settings.privacy.textAndCall.canText.title',
          everybody: 'user.settings.privacy.textAndCall.canText.everybody',
          friends: 'user.settings.privacy.textAndCall.canText.friends',
          contacted: 'user.settings.privacy.textAndCall.canText.contacted'
        },
        canCall: {
          title: 'user.settings.privacy.textAndCall.canCall.title',
          everybody: 'user.settings.privacy.textAndCall.canCall.everybody',
          friends: 'user.settings.privacy.textAndCall.canCall.friends',
          contacted: 'user.settings.privacy.textAndCall.canCall.contacted'
        }
      },
      search: {
        title: 'user.settings.privacy.search.title',
        allowSearchOnPhoneNumber: {
          title: 'user.settings.privacy.search.allowSearchOnPhoneNumber.title',
          description: 'user.settings.privacy.search.allowSearchOnPhoneNumber.description'
        }
      }
    },
    sync: {
      title: 'user.settings.sync.title',
      syncSuggestion: {
        title: 'user.settings.sync.syncSuggestion.title',
        description: 'user.settings.sync.syncSuggestion.description'
      },
      showSyncProgress: {
        title: 'user.settings.sync.showSyncProgress.title',
        description: 'user.settings.sync.showSyncProgress.description'
      }
    },
    appearance: {
      title: 'user.settings.appearance.title',
      theme: {
        title: 'user.settings.appearance.theme.title',
        description: 'user.settings.appearance.theme.description',
        light: 'user.settings.appearance.theme.light',
        dark: 'user.settings.appearance.theme.dark',
        system: 'user.settings.appearance.theme.system'
      }
    },
    messages: {
      title: 'user.settings.messages.title',
      quickResponse: {
        title: 'user.settings.messages.quickResponse.title',
        description: 'user.settings.messages.quickResponse.description'
      },
      separatePriorityAndOther: {
        title: 'user.settings.messages.separatePriorityAndOther.title',
        description: 'user.settings.messages.separatePriorityAndOther.description'
      },
      showTypingStatus: {
        title: 'user.settings.messages.showTypingStatus.title',
        description: 'user.settings.messages.showTypingStatus.description'
      }
    },
    utilities: {
      title: 'user.settings.utilities.title',
      stickerSuggestion: {
        title: 'user.settings.utilities.stickerSuggestion.title',
        description: 'user.settings.utilities.stickerSuggestion.description'
      }
    },
    accountPrivacy: {
      title: 'user.settings.accountPrivacy.title',
      description: 'user.settings.accountPrivacy.description',
      changePassword: {
        title: 'user.settings.accountPrivacy.changePassword.title',
        description: 'user.settings.accountPrivacy.changePassword.description',
        currentPasswordLabel: 'user.settings.accountPrivacy.changePassword.currentPasswordLabel',
        currentPasswordPlaceholder: 'user.settings.accountPrivacy.changePassword.currentPasswordPlaceholder',
        newPasswordLabel: 'user.settings.accountPrivacy.changePassword.newPasswordLabel',
        newPasswordPlaceholder: 'user.settings.accountPrivacy.changePassword.newPasswordPlaceholder',
        confirmPasswordLabel: 'user.settings.accountPrivacy.changePassword.confirmPasswordLabel',
        confirmPasswordPlaceholder: 'user.settings.accountPrivacy.changePassword.confirmPasswordPlaceholder',
        changeButton: 'user.settings.accountPrivacy.changePassword.changeButton',
        changing: 'user.settings.accountPrivacy.changePassword.changing',
        success: 'user.settings.accountPrivacy.changePassword.success',
        error: 'user.settings.accountPrivacy.changePassword.error'
      },
      deviceManagement: {
        title: 'user.settings.accountPrivacy.deviceManagement.title',
        description: 'user.settings.accountPrivacy.deviceManagement.description',
        showAllButton: 'user.settings.accountPrivacy.deviceManagement.showAllButton',
        hideButton: 'user.settings.accountPrivacy.deviceManagement.hideButton',
        currentDevice: 'user.settings.accountPrivacy.deviceManagement.currentDevice',
        lastActive: 'user.settings.accountPrivacy.deviceManagement.lastActive',
        createdAt: 'user.settings.accountPrivacy.deviceManagement.createdAt',
        loading: 'user.settings.accountPrivacy.deviceManagement.loading',
        noDevices: 'user.settings.accountPrivacy.deviceManagement.noDevices',
        deleteButton: 'user.settings.accountPrivacy.deviceManagement.deleteButton',
        deleteConfirm: 'user.settings.accountPrivacy.deviceManagement.deleteConfirm',
        deleteSuccess: 'user.settings.accountPrivacy.deviceManagement.deleteSuccess',
        deleteError: 'user.settings.accountPrivacy.deviceManagement.deleteError',
        browserLabel: 'user.settings.accountPrivacy.deviceManagement.browserLabel',
        osLabel: 'user.settings.accountPrivacy.deviceManagement.osLabel',
        ipLabel: 'user.settings.accountPrivacy.deviceManagement.ipLabel',
        logout: 'user.settings.accountPrivacy.deviceManagement.logout',
        logoutOthers: 'user.settings.accountPrivacy.deviceManagement.logoutOthers',
        logoutOthersConfirm: 'user.settings.accountPrivacy.deviceManagement.logoutOthersConfirm',
        logoutOthersSuccess: 'user.settings.accountPrivacy.deviceManagement.logoutOthersSuccess',
        logoutOthersError: 'user.settings.accountPrivacy.deviceManagement.logoutOthersError',
        activeStatus: 'user.settings.accountPrivacy.deviceManagement.activeStatus',
        activeDevices: 'user.settings.accountPrivacy.deviceManagement.activeDevices',
        inactiveDevices: 'user.settings.accountPrivacy.deviceManagement.inactiveDevices'
      }
    }
  }
} as const
