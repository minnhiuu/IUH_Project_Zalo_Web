import type { TFunction } from 'i18next'
import { USER_KEYS } from './user.keys'

export const createUserTexts = (t: TFunction<'user'>) => ({
  menu: {
    profile: t(USER_KEYS.menu.profile),
    settings: t(USER_KEYS.menu.settings),
    language: t(USER_KEYS.menu.language),
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
    repositionPhoto: t(USER_KEYS.profile.repositionPhoto)
  },
  validation: {
    fullNameRequired: t(USER_KEYS.validation.fullNameRequired),
    dobInvalid: t(USER_KEYS.validation.dobInvalid),
    genderRequired: t(USER_KEYS.validation.genderRequired),
    bioTooLong: t(USER_KEYS.validation.bioTooLong)
  },
  settings: {
    title: t(USER_KEYS.settings.title),
    menu: {
      general: t(USER_KEYS.settings.menu.general),
      security: t(USER_KEYS.settings.menu.security),
      privacy: t(USER_KEYS.settings.menu.privacy),
      sync: t(USER_KEYS.settings.menu.sync),
      appearance: t(USER_KEYS.settings.menu.appearance),
      messages: t(USER_KEYS.settings.menu.messages),
      utilities: t(USER_KEYS.settings.menu.utilities)
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
          nobody: t(USER_KEYS.settings.privacy.textAndCall.canText.nobody)
        },
        canCall: {
          title: t(USER_KEYS.settings.privacy.textAndCall.canCall.title),
          everybody: t(USER_KEYS.settings.privacy.textAndCall.canCall.everybody),
          friends: t(USER_KEYS.settings.privacy.textAndCall.canCall.friends),
          nobody: t(USER_KEYS.settings.privacy.textAndCall.canCall.nobody)
        }
      },
      search: {
        title: t(USER_KEYS.settings.privacy.search.title),
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
        dark: t(USER_KEYS.settings.appearance.theme.dark)
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
    }
  }
})
