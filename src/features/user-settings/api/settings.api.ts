import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'
import type {
  UserSettingResponse,
  PrivacySettings,
  NotificationSettings,
  GeneralSettingsUpdateRequest,
  SecuritySettingsUpdateRequest,
  PrivacySettingsUpdateRequest,
  SyncSettingsUpdateRequest,
  AppearanceSettingsUpdateRequest,
  MessageSettingsUpdateRequest,
  NotificationSettingsUpdateRequest,
  UtilitiesSettingsUpdateRequest
} from '@/features/user-settings/schemas/settings.schema'

type BackendAppLanguage = 'VI' | 'EN'
type BackendThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM'
type BackendSettingScope = 'EVERYONE' | 'FRIENDS' | 'FRIENDS_AND_CONTACTED' | 'ONLY_ME' | 'OFF'

type BackendUserSettingResponse = {
  languageAndInterface: {
    language: BackendAppLanguage
    themeMode: BackendThemeMode
    fontScale: number
  }
  notificationSettings: {
    allowNotifications: boolean
    notifSound: boolean
    notifVibration: boolean
    notifMessages: boolean
    notifGroups: boolean
    notifFriendRequests: boolean
    doNotDisturb: {
      dndEnabled: boolean
      dndStartTime: string
      dndEndTime: string
      dndTimezone: string
      activeDays: string[]
    }
  }
  messageSettings: {
    messagePreview: boolean
    autoDownload: boolean
    showArchivedMessages: boolean
  }
  privacySettings: {
    birthdayVisibility: BackendSettingScope
    showAccessStatus: boolean
    showSeenStatus: boolean
    allowMessaging: BackendSettingScope
    allowCallsPrivacy: BackendSettingScope
    friendSourceByPhone: boolean
  }
  contactSettings: {
    syncContacts: boolean
    autoAddFromPhoneContacts: boolean
  }
  accountSecuritySettings: {
    twoFactorEnabled: boolean
  }
  dataOnDeviceSettings: {
    allowCellularMediaDownload: boolean
  }
}

const mapScopeToPrivacyLevel = (scope: BackendSettingScope) => {
  switch (scope) {
    case 'FRIENDS':
      return 'FRIENDS' as const
    case 'FRIENDS_AND_CONTACTED':
      return 'FRIENDS_AND_CONTACTED' as const
    case 'ONLY_ME':
      return 'ONLY_ME' as const
    case 'OFF':
      return 'OFF' as const
    case 'EVERYONE':
    default:
      return 'EVERYONE' as const
  }
}

const mapPrivacyLevelToScope = (
  level: 'EVERYONE' | 'FRIENDS' | 'FRIENDS_AND_CONTACTED' | 'ONLY_ME' | 'OFF'
): BackendSettingScope => {
  switch (level) {
    case 'FRIENDS':
      return 'FRIENDS'
    case 'FRIENDS_AND_CONTACTED':
      return 'FRIENDS_AND_CONTACTED'
    case 'ONLY_ME':
      return 'ONLY_ME'
    case 'OFF':
      return 'OFF'
    case 'EVERYONE':
    default:
      return 'EVERYONE'
  }
}

const mapScopeToDobVisibility = (scope: BackendSettingScope) => {
  switch (scope) {
    case 'ONLY_ME':
    case 'OFF':
      return 'HIDDEN' as const
    case 'FRIENDS':
    case 'FRIENDS_AND_CONTACTED':
      return 'MONTH_DAY_ONLY' as const
    case 'EVERYONE':
    default:
      return 'FULL_DATE' as const
  }
}

const mapDobVisibilityToScope = (visibility: 'HIDDEN' | 'FULL_DATE' | 'MONTH_DAY_ONLY'): BackendSettingScope => {
  switch (visibility) {
    case 'HIDDEN':
      return 'ONLY_ME'
    case 'MONTH_DAY_ONLY':
      return 'FRIENDS'
    case 'FULL_DATE':
    default:
      return 'EVERYONE'
  }
}

const toFrontendSettings = (backend: BackendUserSettingResponse): UserSettingResponse => ({
  generalSettings: {
    showAllFriends: false,
    languageEn: backend.languageAndInterface?.language === 'EN'
  },
  securitySettings: {
    twoFactorEnabled: backend.accountSecuritySettings?.twoFactorEnabled ?? false
  },
  privacySettings: {
    showDob: mapScopeToDobVisibility(backend.privacySettings?.birthdayVisibility ?? 'EVERYONE'),
    showActiveStatus: backend.privacySettings?.showAccessStatus ?? true,
    showReadStatus: backend.privacySettings?.showSeenStatus ?? true,
    canText: mapScopeToPrivacyLevel(backend.privacySettings?.allowMessaging ?? 'EVERYONE'),
    canCall: mapScopeToPrivacyLevel(backend.privacySettings?.allowCallsPrivacy ?? 'EVERYONE'),
    showPosts: true,
    showPostAfter: null,
    allowSearchOnPhoneNumber: backend.privacySettings?.friendSourceByPhone ?? true
  },
  syncSettings: {
    syncSuggestion: backend.contactSettings?.syncContacts ?? false,
    showSyncProgress: backend.contactSettings?.autoAddFromPhoneContacts ?? false
  },
  appearanceSettings: {
    theme: (backend.languageAndInterface?.themeMode ?? 'SYSTEM') !== 'DARK'
  },
  messageSettings: {
    quickResponseEnable: backend.messageSettings?.messagePreview ?? true,
    separatePriorityAndOtherEnable: backend.messageSettings?.showArchivedMessages ?? false,
    showTypingStatus: backend.messageSettings?.autoDownload ?? true
  },
  notificationSettings: {
    allowNotifications: backend.notificationSettings?.allowNotifications ?? true,
    notifSound: backend.notificationSettings?.notifSound ?? true,
    notifVibration: backend.notificationSettings?.notifVibration ?? true,
    notifFriendRequests: backend.notificationSettings?.notifFriendRequests ?? true,
    notifyNewMessageFromDirect: backend.notificationSettings?.notifMessages ?? true,
    previewNewMessageFromDirect: backend.messageSettings?.messagePreview ?? true,
    notifyNewMessageFromGroup: backend.notificationSettings?.notifGroups ?? true,
    notifyCall: backend.notificationSettings?.allowNotifications ?? true,
    notifyNewPostFromFriend: backend.notificationSettings?.notifFriendRequests ?? true,
    notifyDOB: backend.notificationSettings?.notifFriendRequests ?? true,
    notifyNewMessage: backend.notificationSettings?.notifMessages ?? true,
    shakeOnNewMessage: backend.notificationSettings?.notifVibration ?? true,
    previewNewMessage: backend.messageSettings?.messagePreview ?? true,
    doNotDisturb: {
      dndEnabled: backend.notificationSettings?.doNotDisturb?.dndEnabled ?? false,
      dndStartTime: backend.notificationSettings?.doNotDisturb?.dndStartTime ?? '23:00',
      dndEndTime: backend.notificationSettings?.doNotDisturb?.dndEndTime ?? '07:00',
      dndTimezone: backend.notificationSettings?.doNotDisturb?.dndTimezone ?? 'GMT+7',
      activeDays: backend.notificationSettings?.doNotDisturb?.activeDays ?? ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    }
  },
  utilitiesSettings: {
    stickerSuggestion: backend.dataOnDeviceSettings?.allowCellularMediaDownload ?? false
  }
})

export const settingsApi = {
  // Get all settings
  getMySettings: async () => {
    const response = await http.get<ApiResponse<BackendUserSettingResponse>>('/users/settings/me')
    return {
      ...response,
      data: {
        ...response.data,
        data: toFrontendSettings(response.data.data)
      }
    }
  },

  // Get specific section settings
  getGeneralSettings: async () => {
    const response = await http.get<ApiResponse<BackendUserSettingResponse['languageAndInterface']>>(
      '/users/settings/me/language-and-interface'
    )
    return {
      ...response,
      data: {
        ...response.data,
        data: {
          showAllFriends: false,
          languageEn: response.data.data.language === 'EN'
        }
      }
    }
  },
  getPrivacySettings: async () => {
    const response =
      await http.get<ApiResponse<BackendUserSettingResponse['privacySettings']>>('/users/settings/me/privacy')
    const privacy = response.data.data
    const mapped: PrivacySettings = {
      showDob: mapScopeToDobVisibility(privacy.birthdayVisibility),
      showActiveStatus: privacy.showAccessStatus,
      showReadStatus: privacy.showSeenStatus,
      canText: mapScopeToPrivacyLevel(privacy.allowMessaging),
      canCall: mapScopeToPrivacyLevel(privacy.allowCallsPrivacy),
      showPosts: true,
      showPostAfter: null,
      allowSearchOnPhoneNumber: privacy.friendSourceByPhone
    }
    return {
      ...response,
      data: {
        ...response.data,
        data: mapped
      }
    }
  },
  getNotificationSettings: async () => {
    const response = await http.get<ApiResponse<BackendUserSettingResponse['notificationSettings']>>(
      '/users/settings/me/notification'
    )
    const notification = response.data.data
    const mapped: NotificationSettings = {
      notifSound: notification.notifSound,
      notifyNewMessageFromDirect: notification.notifMessages,
      previewNewMessageFromDirect: true,
      notifyNewMessageFromGroup: notification.notifGroups,
      notifyCall: notification.allowNotifications,
      notifyNewPostFromFriend: notification.notifFriendRequests,
      notifyDOB: notification.notifFriendRequests,
      notifyNewMessage: notification.notifMessages,
      shakeOnNewMessage: notification.notifVibration,
      previewNewMessage: true,
      doNotDisturb: {
        dndEnabled: notification.doNotDisturb?.dndEnabled ?? false,
        dndStartTime: notification.doNotDisturb?.dndStartTime ?? '23:00',
        dndEndTime: notification.doNotDisturb?.dndEndTime ?? '07:00',
        activeDays: notification.doNotDisturb?.activeDays ?? ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      }
    }
    return {
      ...response,
      data: {
        ...response.data,
        data: mapped
      }
    }
  },

  // Update settings by category
  updateGeneralSettings: async (data: GeneralSettingsUpdateRequest) => {
    const response = await http.put<ApiResponse<BackendUserSettingResponse>>(
      '/users/settings/me/language-and-interface',
      {
        language: data.languageEn ? 'EN' : 'VI'
      }
    )
    return {
      ...response,
      data: {
        ...response.data,
        data: toFrontendSettings(response.data.data)
      }
    }
  },

  updateSecuritySettings: async (data: SecuritySettingsUpdateRequest) => {
    const response = await http.put<ApiResponse<BackendUserSettingResponse>>('/users/settings/me/account-security', {
      twoFactorEnabled: data.twoFactorEnabled,
      lockAppEnabled: false,
      biometricsEnabled: false,
      logoutOtherDevicesOnPasswordChange: true
    })
    return {
      ...response,
      data: {
        ...response.data,
        data: toFrontendSettings(response.data.data)
      }
    }
  },

  updatePrivacySettings: async (data: PrivacySettingsUpdateRequest) => {
    const response = await http.put<ApiResponse<BackendUserSettingResponse>>('/users/settings/me/privacy', {
      birthdayVisibility: mapDobVisibilityToScope(data.showDob),
      showAccessStatus: data.showActiveStatus,
      showSeenStatus: data.showReadStatus,
      allowMessaging: mapPrivacyLevelToScope(data.canText),
      allowCallsPrivacy: mapPrivacyLevelToScope(data.canCall),
      allowViewAndCommentOnJournal: 'FRIENDS',
      blockUnknownUsers: false,
      friendSourceByPhone: data.allowSearchOnPhoneNumber,
      friendSourceByQr: true,
      utilityPermissions: [],
      blockedUserIds: []
    })
    return {
      ...response,
      data: {
        ...response.data,
        data: toFrontendSettings(response.data.data)
      }
    }
  },

  updateSyncSettings: async (data: SyncSettingsUpdateRequest) => {
    const response = await http.put<ApiResponse<BackendUserSettingResponse>>('/users/settings/me/contact', {
      syncContacts: data.syncSuggestion,
      autoAddFromPhoneContacts: data.showSyncProgress
    })
    return {
      ...response,
      data: {
        ...response.data,
        data: toFrontendSettings(response.data.data)
      }
    }
  },

  updateAppearanceSettings: async (data: AppearanceSettingsUpdateRequest) => {
    const response = await http.put<ApiResponse<BackendUserSettingResponse>>(
      '/users/settings/me/language-and-interface',
      {
        themeMode: data.theme ? 'LIGHT' : 'DARK'
      }
    )
    return {
      ...response,
      data: {
        ...response.data,
        data: toFrontendSettings(response.data.data)
      }
    }
  },

  updateMessageSettings: async (data: MessageSettingsUpdateRequest) => {
    const response = await http.put<ApiResponse<BackendUserSettingResponse>>('/users/settings/me/message', {
      messagePreview: data.quickResponseEnable,
      fontSize: 'MEDIUM',
      chatTheme: 'default',
      autoDownload: data.showTypingStatus,
      saveToLibrary: false,
      endToEndEncryption: true,
      showArchivedMessages: data.separatePriorityAndOtherEnable
    })
    return {
      ...response,
      data: {
        ...response.data,
        data: toFrontendSettings(response.data.data)
      }
    }
  },

  updateNotificationSettings: async (data: NotificationSettingsUpdateRequest) => {
    const response = await http.put<ApiResponse<BackendUserSettingResponse>>('/users/settings/me/notification', {
      allowNotifications: data.allowNotifications,
      notifSound: data.notifSound,
      notifVibration: data.notifVibration,
      notifMessages: data.notifyNewMessageFromDirect,
      notifGroups: data.notifyNewMessageFromGroup,
      notifFriendRequests: data.notifFriendRequests,
      doNotDisturb: {
        dndEnabled: data.doNotDisturb.dndEnabled,
        dndStartTime: data.doNotDisturb.dndStartTime,
        dndEndTime: data.doNotDisturb.dndEndTime,
        dndTimezone: data.doNotDisturb.dndTimezone,
        activeDays: data.doNotDisturb.activeDays
      }
    })
    return {
      ...response,
      data: {
        ...response.data,
        data: toFrontendSettings(response.data.data)
      }
    }
  },

  updateUtilitiesSettings: async (data: UtilitiesSettingsUpdateRequest) => {
    const response = await http.put<ApiResponse<BackendUserSettingResponse>>('/users/settings/me/data-on-device', {
      allowCellularMediaDownload: data.stickerSuggestion,
      cacheCleanupThresholdMB: 500
    })
    return {
      ...response,
      data: {
        ...response.data,
        data: toFrontendSettings(response.data.data)
      }
    }
  },

  // Reset settings
  resetToDefaults: async () => {
    const response = await http.post<ApiResponse<BackendUserSettingResponse>>('/users/settings/me/reset')
    return {
      ...response,
      data: {
        ...response.data,
        data: toFrontendSettings(response.data.data)
      }
    }
  }
}
