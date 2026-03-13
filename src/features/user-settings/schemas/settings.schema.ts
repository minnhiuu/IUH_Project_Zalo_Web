// Enums matching backend
export const PrivacyLevel = {
  EVERYONE: 'EVERYONE',
  FRIENDS: 'FRIENDS',
  FRIENDS_AND_CONTACTED: 'FRIENDS_AND_CONTACTED',
  ONLY_ME: 'ONLY_ME',
  OFF: 'OFF'
} as const

export type PrivacyLevel = (typeof PrivacyLevel)[keyof typeof PrivacyLevel]

export const DobVisibility = {
  HIDDEN: 'HIDDEN',
  FULL_DATE: 'FULL_DATE',
  MONTH_DAY_ONLY: 'MONTH_DAY_ONLY'
} as const

export type DobVisibility = (typeof DobVisibility)[keyof typeof DobVisibility]

// Settings models matching backend
export type GeneralSettings = {
  showAllFriends: boolean
  languageEn: boolean
}

export type SecuritySettings = {
  twoFactorEnabled: boolean
}

export type PrivacySettings = {
  // Personal
  showDob: DobVisibility
  showActiveStatus: boolean

  // Text and call
  showReadStatus: boolean
  canText: PrivacyLevel
  canCall: PrivacyLevel

  // Post
  showPosts: boolean
  showPostAfter: string | null

  // Search source
  allowSearchOnPhoneNumber: boolean
}

export type SyncSettings = {
  syncSuggestion: boolean
  showSyncProgress: boolean
}

export type AppearanceSettings = {
  theme: boolean // true = light, false = dark
}

export type MessageSettings = {
  quickResponseEnable: boolean
  separatePriorityAndOtherEnable: boolean
  showTypingStatus: boolean
}

export type NotificationSettings = {
  notifSound: boolean

  // Direct message
  notifyNewMessageFromDirect: boolean
  previewNewMessageFromDirect: boolean

  // Group message
  notifyNewMessageFromGroup: boolean

  // Call
  notifyCall: boolean

  // Post
  notifyNewPostFromFriend: boolean

  // Dob
  notifyDOB: boolean

  // Notification in app
  notifyNewMessage: boolean
  shakeOnNewMessage: boolean
  previewNewMessage: boolean
}

export type UtilitiesSettings = {
  stickerSuggestion: boolean
}

// Complete user settings response
export type UserSettingResponse = {
  generalSettings: GeneralSettings
  securitySettings: SecuritySettings
  privacySettings: PrivacySettings
  syncSettings: SyncSettings
  appearanceSettings: AppearanceSettings
  messageSettings: MessageSettings
  notificationSettings: NotificationSettings
  utilitiesSettings: UtilitiesSettings
}

// Update request types
export type GeneralSettingsUpdateRequest = {
  showAllFriends: boolean
  languageEn: boolean
}

export type SecuritySettingsUpdateRequest = {
  twoFactorEnabled: boolean
}

export type PrivacySettingsUpdateRequest = {
  showDob: DobVisibility
  showActiveStatus: boolean
  showReadStatus: boolean
  canText: PrivacyLevel
  canCall: PrivacyLevel
  showPosts: boolean
  showPostAfter: string | null
  allowSearchOnPhoneNumber: boolean
}

export type SyncSettingsUpdateRequest = {
  syncSuggestion: boolean
  showSyncProgress: boolean
}

export type AppearanceSettingsUpdateRequest = {
  theme: boolean
}

export type MessageSettingsUpdateRequest = {
  quickResponseEnable: boolean
  separatePriorityAndOtherEnable: boolean
  showTypingStatus: boolean
}

export type NotificationSettingsUpdateRequest = {
  notifSound: boolean
  notifyNewMessageFromDirect: boolean
  previewNewMessageFromDirect: boolean
  notifyNewMessageFromGroup: boolean
  notifyCall: boolean
  notifyNewPostFromFriend: boolean
  notifyDOB: boolean
  notifyNewMessage: boolean
  shakeOnNewMessage: boolean
  previewNewMessage: boolean
}

export type UtilitiesSettingsUpdateRequest = {
  stickerSuggestion: boolean
}
