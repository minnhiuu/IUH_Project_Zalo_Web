import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'
import type {
  UserSettingResponse,
  GeneralSettings,
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

export const settingsApi = {
  // Get all settings
  getMySettings: () => http.get<ApiResponse<UserSettingResponse>>('/users/settings/me'),

  // Get specific section settings
  getGeneralSettings: () => http.get<ApiResponse<GeneralSettings>>('/users/settings/me/general'),
  getPrivacySettings: () => http.get<ApiResponse<PrivacySettings>>('/users/settings/me/privacy'),
  getNotificationSettings: () => http.get<ApiResponse<NotificationSettings>>('/users/settings/me/notification'),

  // Update settings by category
  updateGeneralSettings: (data: GeneralSettingsUpdateRequest) =>
    http.put<ApiResponse<UserSettingResponse>>('/users/settings/general', data),

  updateSecuritySettings: (data: SecuritySettingsUpdateRequest) =>
    http.put<ApiResponse<UserSettingResponse>>('/users/settings/security', data),

  updatePrivacySettings: (data: PrivacySettingsUpdateRequest) =>
    http.put<ApiResponse<UserSettingResponse>>('/users/settings/privacy', data),

  updateSyncSettings: (data: SyncSettingsUpdateRequest) =>
    http.put<ApiResponse<UserSettingResponse>>('/users/settings/sync', data),

  updateAppearanceSettings: (data: AppearanceSettingsUpdateRequest) =>
    http.put<ApiResponse<UserSettingResponse>>('/users/settings/appearance', data),

  updateMessageSettings: (data: MessageSettingsUpdateRequest) =>
    http.put<ApiResponse<UserSettingResponse>>('/users/settings/message', data),

  updateNotificationSettings: (data: NotificationSettingsUpdateRequest) =>
    http.put<ApiResponse<UserSettingResponse>>('/users/settings/notification', data),

  updateUtilitiesSettings: (data: UtilitiesSettingsUpdateRequest) =>
    http.put<ApiResponse<UserSettingResponse>>('/users/settings/utilities', data),

  // Reset settings
  resetToDefaults: () => http.post<ApiResponse<UserSettingResponse>>('/users/settings/me/reset')
}
