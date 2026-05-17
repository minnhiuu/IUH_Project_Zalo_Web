import type { TFunction } from 'i18next'
import { USER_KEYS } from './user.keys'

export const createUserTexts = (t: TFunction<'user'>) => ({
  menu: {
    profile: t(USER_KEYS.menu.profile),
    settings: t(USER_KEYS.menu.settings),
    data: t(USER_KEYS.menu.data),
    language: t(USER_KEYS.menu.language),
    support: t(USER_KEYS.menu.support),
    appearance: t(USER_KEYS.menu.appearance),
    themeLight: t(USER_KEYS.menu.themeLight),
    themeDark: t(USER_KEYS.menu.themeDark),
    themeSystem: t(USER_KEYS.menu.themeSystem),
    logout: t(USER_KEYS.menu.logout)
  },
  profile: {
    title: t(USER_KEYS.profile.title),
    personalInfo: t(USER_KEYS.profile.personalInfo),
    gender: t(USER_KEYS.profile.gender),
    dob: t(USER_KEYS.profile.dob),
    phone: t(USER_KEYS.profile.phone),
    update: t(USER_KEYS.profile.update),
    privacyNote: t(USER_KEYS.profile.privacyNote),
    male: t(USER_KEYS.profile.male),
    female: t(USER_KEYS.profile.female),
    editTitle: t(USER_KEYS.profile.editTitle),
    fullNameLabel: t(USER_KEYS.profile.fullNameLabel),
    fullNamePlaceholder: t(USER_KEYS.profile.fullNamePlaceholder),
    fullNameNote: t(USER_KEYS.profile.fullNameNote),
    day: t(USER_KEYS.profile.day),
    month: t(USER_KEYS.profile.month),
    year: t(USER_KEYS.profile.year),
    cancel: t(USER_KEYS.profile.cancel),
    confirm: t(USER_KEYS.profile.confirm),
    edit: t(USER_KEYS.profile.edit),
    updating: t(USER_KEYS.profile.updating),
    phoneLabel: t(USER_KEYS.profile.phoneLabel),
    phonePlaceholder: t(USER_KEYS.profile.phonePlaceholder),
    bioLabel: t(USER_KEYS.profile.bioLabel),
    bioPlaceholder: t(USER_KEYS.profile.bioPlaceholder),
    bio: t(USER_KEYS.profile.bio),
    noBio: t(USER_KEYS.profile.noBio),
    selectImageError: t(USER_KEYS.profile.selectImageError),
    updateAvatarSuccess: t(USER_KEYS.profile.updateAvatarSuccess),
    updateBackgroundSuccess: t(USER_KEYS.profile.updateBackgroundSuccess),
    updateAvatarTitle: t(USER_KEYS.profile.updateAvatarTitle),
    updateBackgroundTitle: t(USER_KEYS.profile.updateBackgroundTitle),
    dragToMove: t(USER_KEYS.profile.dragToMove),
    editCover: t(USER_KEYS.profile.editCover),
    addPhoto: t(USER_KEYS.profile.addPhoto),
    uploadPhoto: t(USER_KEYS.profile.uploadPhoto),
    repositionPhoto: t(USER_KEYS.profile.repositionPhoto),
    addFriend: t(USER_KEYS.profile.addFriend),
    message: t(USER_KEYS.profile.message),
    images: t(USER_KEYS.profile.images),
    noImages: t(USER_KEYS.profile.noImages),
    mutualGroups: (count: number) => t(USER_KEYS.profile.mutualGroups, { count }),
    shareContact: t(USER_KEYS.profile.shareContact),
    block: t(USER_KEYS.profile.block),
    editBlock: t(USER_KEYS.profile.editBlock),
    report: t(USER_KEYS.profile.report),
    deleteFriend: t(USER_KEYS.profile.deleteFriend),
    page: {
      myTitle: t(USER_KEYS.profile.page.myTitle),
      editProfile: t(USER_KEYS.profile.page.editProfile),
      postsHeading: t(USER_KEYS.profile.page.postsHeading),
      loadingMore: t(USER_KEYS.profile.page.loadingMore),
      loadError: t(USER_KEYS.profile.page.loadError),
      retry: t(USER_KEYS.profile.page.retry),
      noPosts: t(USER_KEYS.profile.page.noPosts),
      noPostsHint: t(USER_KEYS.profile.page.noPostsHint),
      noPostsOther: t(USER_KEYS.profile.page.noPostsOther),
      noPostsOtherHint: t(USER_KEYS.profile.page.noPostsOtherHint),
      addFriend: t(USER_KEYS.profile.page.addFriend),
      message: t(USER_KEYS.profile.page.message),
      about: t(USER_KEYS.profile.page.about),
      fieldBio: t(USER_KEYS.profile.page.fieldBio),
      fieldGender: t(USER_KEYS.profile.page.fieldGender),
      fieldBirthday: t(USER_KEYS.profile.page.fieldBirthday),
      fieldEmail: t(USER_KEYS.profile.page.fieldEmail),
      fieldPhone: t(USER_KEYS.profile.page.fieldPhone),
      fieldRole: t(USER_KEYS.profile.page.fieldRole),
      genderMale: t(USER_KEYS.profile.page.genderMale),
      genderFemale: t(USER_KEYS.profile.page.genderFemale),
      friendsTab: t(USER_KEYS.profile.page.friendsTab),
      searchPlaceholder: t(USER_KEYS.profile.page.searchPlaceholder),
      mutualFriends: (count: number) => t(USER_KEYS.profile.page.mutualFriends, { count }),
      noFriends: t(USER_KEYS.profile.page.noFriends),
      noMutualFriends: t(USER_KEYS.profile.page.noMutualFriends),
      featureInDevelopment: t(USER_KEYS.profile.page.featureInDevelopment)
    },
    goToSettings: t(USER_KEYS.profile.goToSettings)
  },
  validation: {
    fullNameRequired: t(USER_KEYS.validation.fullNameRequired),
    dobInvalid: t(USER_KEYS.validation.dobInvalid),
    genderRequired: t(USER_KEYS.validation.genderRequired),
    bioTooLong: t(USER_KEYS.validation.bioTooLong),
    phoneRequired: t(USER_KEYS.validation.phoneRequired),
    phoneInvalid: t(USER_KEYS.validation.phoneInvalid),
    phoneAlreadyUsed: t(USER_KEYS.validation.phoneAlreadyUsed)
  },
  settings: {
    title: t(USER_KEYS.settings.title),
    menu: {
      general: t(USER_KEYS.settings.menu.general),
      security: t(USER_KEYS.settings.menu.security),
      privacy: t(USER_KEYS.settings.menu.privacy),
      sync: t(USER_KEYS.settings.menu.sync),
      appearance: t(USER_KEYS.settings.menu.appearance),
      notification: t(USER_KEYS.settings.menu.notification),
      messages: t(USER_KEYS.settings.menu.messages),
      utilities: t(USER_KEYS.settings.menu.utilities),
      accountPrivacy: t(USER_KEYS.settings.menu.accountPrivacy)
    },
    general: {
      title: t(USER_KEYS.settings.general.title),
      showAllFriends: {
        title: t(USER_KEYS.settings.general.showAllFriends.title),
        description: t(USER_KEYS.settings.general.showAllFriends.description),
        all: t(USER_KEYS.settings.general.showAllFriends.all),
        onlyBondhub: t(USER_KEYS.settings.general.showAllFriends.onlyBondhub)
      },
      language: {
        title: t(USER_KEYS.settings.general.language.title),
        description: t(USER_KEYS.settings.general.language.description),
        english: t(USER_KEYS.settings.general.language.english),
        vietnamese: t(USER_KEYS.settings.general.language.vietnamese)
      }
    },
    security: {
      title: t(USER_KEYS.settings.security.title),
      twoFactor: {
        title: t(USER_KEYS.settings.security.twoFactor.title),
        description: t(USER_KEYS.settings.security.twoFactor.description)
      }
    },
    privacy: {
      title: t(USER_KEYS.settings.privacy.title),
      personal: {
        title: t(USER_KEYS.settings.privacy.personal.title),
        showDob: {
          title: t(USER_KEYS.settings.privacy.personal.showDob.title),
          description: t(USER_KEYS.settings.privacy.personal.showDob.description),
          hidden: t(USER_KEYS.settings.privacy.personal.showDob.hidden),
          fullDate: t(USER_KEYS.settings.privacy.personal.showDob.fullDate),
          monthDayOnly: t(USER_KEYS.settings.privacy.personal.showDob.monthDayOnly)
        },
        showActiveStatus: {
          title: t(USER_KEYS.settings.privacy.personal.showActiveStatus.title),
          description: t(USER_KEYS.settings.privacy.personal.showActiveStatus.description)
        }
      },
      textAndCall: {
        title: t(USER_KEYS.settings.privacy.textAndCall.title),
        showReadStatus: {
          title: t(USER_KEYS.settings.privacy.textAndCall.showReadStatus.title),
          description: t(USER_KEYS.settings.privacy.textAndCall.showReadStatus.description)
        },
        canText: {
          title: t(USER_KEYS.settings.privacy.textAndCall.canText.title),
          everybody: t(USER_KEYS.settings.privacy.textAndCall.canText.everybody),
          friends: t(USER_KEYS.settings.privacy.textAndCall.canText.friends),
          contacted: t(USER_KEYS.settings.privacy.textAndCall.canText.contacted)
        },
        canCall: {
          title: t(USER_KEYS.settings.privacy.textAndCall.canCall.title),
          everybody: t(USER_KEYS.settings.privacy.textAndCall.canCall.everybody),
          friends: t(USER_KEYS.settings.privacy.textAndCall.canCall.friends),
          contacted: t(USER_KEYS.settings.privacy.textAndCall.canCall.contacted)
        }
      },
      search: {
        title: t(USER_KEYS.settings.privacy.search.title),
        nameSearchVisibility: {
          title: t(USER_KEYS.settings.privacy.search.nameSearchVisibility.title),
          description: t(USER_KEYS.settings.privacy.search.nameSearchVisibility.description)
        },
        phoneSearchVisibility: {
          title: t(USER_KEYS.settings.privacy.search.phoneSearchVisibility.title),
          description: t(USER_KEYS.settings.privacy.search.phoneSearchVisibility.description)
        },
        visibility: {
          public: t(USER_KEYS.settings.privacy.search.visibility.public),
          friendsOfFriends: t(USER_KEYS.settings.privacy.search.visibility.friendsOfFriends),
          friendsOnly: t(USER_KEYS.settings.privacy.search.visibility.friendsOnly),
          none: t(USER_KEYS.settings.privacy.search.visibility.none)
        },
        allowSearchOnPhoneNumber: {
          title: t(USER_KEYS.settings.privacy.search.allowSearchOnPhoneNumber.title),
          description: t(USER_KEYS.settings.privacy.search.allowSearchOnPhoneNumber.description)
        }
      }
    },
    sync: {
      title: t(USER_KEYS.settings.sync.title),
      syncSuggestion: {
        title: t(USER_KEYS.settings.sync.syncSuggestion.title),
        description: t(USER_KEYS.settings.sync.syncSuggestion.description)
      },
      showSyncProgress: {
        title: t(USER_KEYS.settings.sync.showSyncProgress.title),
        description: t(USER_KEYS.settings.sync.showSyncProgress.description)
      }
    },
    appearance: {
      title: t(USER_KEYS.settings.appearance.title),
      theme: {
        title: t(USER_KEYS.settings.appearance.theme.title),
        description: t(USER_KEYS.settings.appearance.theme.description),
        light: t(USER_KEYS.settings.appearance.theme.light),
        dark: t(USER_KEYS.settings.appearance.theme.dark),
        system: t(USER_KEYS.settings.appearance.theme.system)
      }
    },
    notification: {
      title: t(USER_KEYS.settings.notification.title),
      allowNotifications: {
        title: t(USER_KEYS.settings.notification.allowNotifications.title),
        description: t(USER_KEYS.settings.notification.allowNotifications.description)
      },
      sound: {
        title: t(USER_KEYS.settings.notification.sound.title),
        description: t(USER_KEYS.settings.notification.sound.description)
      },
      vibration: {
        title: t(USER_KEYS.settings.notification.vibration.title),
        description: t(USER_KEYS.settings.notification.vibration.description)
      },
      friendRequests: {
        title: t(USER_KEYS.settings.notification.friendRequests.title),
        description: t(USER_KEYS.settings.notification.friendRequests.description)
      },
      directMessages: {
        title: t(USER_KEYS.settings.notification.directMessages.title),
        description: t(USER_KEYS.settings.notification.directMessages.description)
      },
      groupMessages: {
        title: t(USER_KEYS.settings.notification.groupMessages.title),
        description: t(USER_KEYS.settings.notification.groupMessages.description)
      },
      quietMode: {
        title: t(USER_KEYS.settings.notification.quietMode.title),
        description: t(USER_KEYS.settings.notification.quietMode.description),
        startTime: t(USER_KEYS.settings.notification.quietMode.startTime),
        endTime: t(USER_KEYS.settings.notification.quietMode.endTime),
        chooseDays: t(USER_KEYS.settings.notification.quietMode.chooseDays),
        everyday: t(USER_KEYS.settings.notification.quietMode.everyday),
        activeDaysCount: (count: number) => t(USER_KEYS.settings.notification.quietMode.activeDaysCount, { count }),
        timezone: t(USER_KEYS.settings.notification.quietMode.timezone),
        save: t(USER_KEYS.settings.notification.quietMode.save)
      }
    },
    messages: {
      title: t(USER_KEYS.settings.messages.title),
      quickResponse: {
        title: t(USER_KEYS.settings.messages.quickResponse.title),
        description: t(USER_KEYS.settings.messages.quickResponse.description)
      },
      separatePriorityAndOther: {
        title: t(USER_KEYS.settings.messages.separatePriorityAndOther.title),
        description: t(USER_KEYS.settings.messages.separatePriorityAndOther.description)
      },
      showTypingStatus: {
        title: t(USER_KEYS.settings.messages.showTypingStatus.title),
        description: t(USER_KEYS.settings.messages.showTypingStatus.description)
      }
    },
    utilities: {
      title: t(USER_KEYS.settings.utilities.title),
      stickerSuggestion: {
        title: t(USER_KEYS.settings.utilities.stickerSuggestion.title),
        description: t(USER_KEYS.settings.utilities.stickerSuggestion.description)
      }
    },
    accountPrivacy: {
      title: t(USER_KEYS.settings.accountPrivacy.title),
      description: t(USER_KEYS.settings.accountPrivacy.description),
      changePassword: {
        title: t(USER_KEYS.settings.accountPrivacy.changePassword.title),
        description: t(USER_KEYS.settings.accountPrivacy.changePassword.description),
        currentPasswordLabel: t(USER_KEYS.settings.accountPrivacy.changePassword.currentPasswordLabel),
        currentPasswordPlaceholder: t(USER_KEYS.settings.accountPrivacy.changePassword.currentPasswordPlaceholder),
        newPasswordLabel: t(USER_KEYS.settings.accountPrivacy.changePassword.newPasswordLabel),
        newPasswordPlaceholder: t(USER_KEYS.settings.accountPrivacy.changePassword.newPasswordPlaceholder),
        confirmPasswordLabel: t(USER_KEYS.settings.accountPrivacy.changePassword.confirmPasswordLabel),
        confirmPasswordPlaceholder: t(USER_KEYS.settings.accountPrivacy.changePassword.confirmPasswordPlaceholder),
        logoutOtherSessions: t(USER_KEYS.settings.accountPrivacy.changePassword.logoutOtherSessions),
        changeButton: t(USER_KEYS.settings.accountPrivacy.changePassword.changeButton),
        changing: t(USER_KEYS.settings.accountPrivacy.changePassword.changing),
        success: t(USER_KEYS.settings.accountPrivacy.changePassword.success),
        error: t(USER_KEYS.settings.accountPrivacy.changePassword.error),
        validation: {
          currentPasswordRequired: t(
            USER_KEYS.settings.accountPrivacy.changePassword.validation.currentPasswordRequired
          ),
          confirmPasswordRequired: t(
            USER_KEYS.settings.accountPrivacy.changePassword.validation.confirmPasswordRequired
          )
        }
      },
      deviceManagement: {
        title: t(USER_KEYS.settings.accountPrivacy.deviceManagement.title),
        description: t(USER_KEYS.settings.accountPrivacy.deviceManagement.description),
        showAllButton: t(USER_KEYS.settings.accountPrivacy.deviceManagement.showAllButton),
        hideButton: t(USER_KEYS.settings.accountPrivacy.deviceManagement.hideButton),
        currentDevice: t(USER_KEYS.settings.accountPrivacy.deviceManagement.currentDevice),
        lastActive: t(USER_KEYS.settings.accountPrivacy.deviceManagement.lastActive),
        createdAt: t(USER_KEYS.settings.accountPrivacy.deviceManagement.createdAt),
        loading: t(USER_KEYS.settings.accountPrivacy.deviceManagement.loading),
        noDevices: t(USER_KEYS.settings.accountPrivacy.deviceManagement.noDevices),
        deleteButton: t(USER_KEYS.settings.accountPrivacy.deviceManagement.deleteButton),
        deleteConfirm: t(USER_KEYS.settings.accountPrivacy.deviceManagement.deleteConfirm),
        deleteSuccess: t(USER_KEYS.settings.accountPrivacy.deviceManagement.deleteSuccess),
        deleteError: t(USER_KEYS.settings.accountPrivacy.deviceManagement.deleteError),
        browserLabel: t(USER_KEYS.settings.accountPrivacy.deviceManagement.browserLabel),
        osLabel: t(USER_KEYS.settings.accountPrivacy.deviceManagement.osLabel),
        ipLabel: t(USER_KEYS.settings.accountPrivacy.deviceManagement.ipLabel),
        logout: t(USER_KEYS.settings.accountPrivacy.deviceManagement.logout),
        logoutOthers: t(USER_KEYS.settings.accountPrivacy.deviceManagement.logoutOthers),
        logoutOthersConfirm: t(USER_KEYS.settings.accountPrivacy.deviceManagement.logoutOthersConfirm),
        logoutOthersSuccess: t(USER_KEYS.settings.accountPrivacy.deviceManagement.logoutOthersSuccess),
        logoutOthersError: t(USER_KEYS.settings.accountPrivacy.deviceManagement.logoutOthersError),
        logoutConfirm: t(USER_KEYS.settings.accountPrivacy.deviceManagement.logoutConfirm),
        logoutSuccess: t(USER_KEYS.settings.accountPrivacy.deviceManagement.logoutSuccess),
        logoutError: t(USER_KEYS.settings.accountPrivacy.deviceManagement.logoutError),
        activeStatus: t(USER_KEYS.settings.accountPrivacy.deviceManagement.activeStatus),
        activeDevices: t(USER_KEYS.settings.accountPrivacy.deviceManagement.activeDevices),
        inactiveDevices: t(USER_KEYS.settings.accountPrivacy.deviceManagement.inactiveDevices)
      },
      blockedUsers: {
        title: t(USER_KEYS.settings.accountPrivacy.blockedUsers.title),
        description: t(USER_KEYS.settings.accountPrivacy.blockedUsers.description),
        showAllButton: t(USER_KEYS.settings.accountPrivacy.blockedUsers.showAllButton),
        unblockConfirm: (name: string) => t(USER_KEYS.settings.accountPrivacy.blockedUsers.unblockConfirm, { name }),
        unblockSuccess: (name: string) => t(USER_KEYS.settings.accountPrivacy.blockedUsers.unblockSuccess, { name }),
        unblockError: t(USER_KEYS.settings.accountPrivacy.blockedUsers.unblockError),
        unblocking: t(USER_KEYS.settings.accountPrivacy.blockedUsers.unblocking),
        unblockButton: t(USER_KEYS.settings.accountPrivacy.blockedUsers.unblockButton),
        blockDate: (date: string) => t(USER_KEYS.settings.accountPrivacy.blockedUsers.blockDate, { date }),
        empty: t(USER_KEYS.settings.accountPrivacy.blockedUsers.empty),
        emptyDescription: t(USER_KEYS.settings.accountPrivacy.blockedUsers.emptyDescription),
        types: {
          message: t(USER_KEYS.settings.accountPrivacy.blockedUsers.types.message),
          call: t(USER_KEYS.settings.accountPrivacy.blockedUsers.types.call),
          story: t(USER_KEYS.settings.accountPrivacy.blockedUsers.types.story)
        }
      },
      accountActivation: {},
      blockModal: {
        title: t(USER_KEYS.settings.accountPrivacy.blockModal.title),
        editTitle: t(USER_KEYS.settings.accountPrivacy.blockModal.editTitle),
        description: (name: string) => t(USER_KEYS.settings.accountPrivacy.blockModal.description, { name }),
        editDescription: (name: string) => t(USER_KEYS.settings.accountPrivacy.blockModal.editDescription, { name }),
        blockMessage: t(USER_KEYS.settings.accountPrivacy.blockModal.blockMessage),
        blockCall: t(USER_KEYS.settings.accountPrivacy.blockModal.blockCall),
        blockStory: t(USER_KEYS.settings.accountPrivacy.blockModal.blockStory),
        confirmButton: t(USER_KEYS.settings.accountPrivacy.blockModal.confirmButton),
        updateButton: t(USER_KEYS.settings.accountPrivacy.blockModal.updateButton),
        cancelButton: t(USER_KEYS.settings.accountPrivacy.blockModal.cancelButton),
        unblockButton: t(USER_KEYS.settings.accountPrivacy.blockModal.unblockButton),
        blockSuccess: (name: string) => t(USER_KEYS.settings.accountPrivacy.blockModal.blockSuccess, { name }),
        blockError: t(USER_KEYS.settings.accountPrivacy.blockModal.blockError),
        updateSuccess: t(USER_KEYS.settings.accountPrivacy.blockModal.updateSuccess),
        updateError: t(USER_KEYS.settings.accountPrivacy.blockModal.updateError),
        unblockSuccess: (name: string) => t(USER_KEYS.settings.accountPrivacy.blockModal.unblockSuccess, { name }),
        unblockError: t(USER_KEYS.settings.accountPrivacy.blockModal.unblockError)
      }
    }
  }
})
