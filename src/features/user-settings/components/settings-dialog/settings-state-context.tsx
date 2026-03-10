import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { settingsApi } from '@/features/user-settings/api/settings.api'
import { settingsKeys, useMySettings } from '@/features/user-settings/queries/use-settings'
import type {
  UserSettingResponse,
  GeneralSettingsUpdateRequest,
  SecuritySettingsUpdateRequest,
  PrivacySettingsUpdateRequest,
  SyncSettingsUpdateRequest,
  AppearanceSettingsUpdateRequest,
  MessageSettingsUpdateRequest,
  UtilitiesSettingsUpdateRequest
} from '@/features/user-settings/schemas/settings.schema'
import { useQueryClient } from '@tanstack/react-query'

interface PendingState {
  general: boolean
  security: boolean
  privacy: boolean
  sync: boolean
  appearance: boolean
  message: boolean
  utilities: boolean
}

interface SettingsStateContextValue {
  settings: UserSettingResponse | null
  isLoading: boolean
  pending: PendingState
  updateGeneralSettings: (data: GeneralSettingsUpdateRequest) => Promise<void>
  updateSecuritySettings: (data: SecuritySettingsUpdateRequest) => Promise<void>
  updatePrivacySettings: (data: PrivacySettingsUpdateRequest) => Promise<void>
  updateSyncSettings: (data: SyncSettingsUpdateRequest) => Promise<void>
  updateAppearanceSettings: (data: AppearanceSettingsUpdateRequest) => Promise<void>
  updateMessageSettings: (data: MessageSettingsUpdateRequest) => Promise<void>
  updateUtilitiesSettings: (data: UtilitiesSettingsUpdateRequest) => Promise<void>
}

const defaultPending: PendingState = {
  general: false,
  security: false,
  privacy: false,
  sync: false,
  appearance: false,
  message: false,
  utilities: false
}

const SettingsStateContext = createContext<SettingsStateContextValue | null>(null)

interface SettingsStateProviderProps {
  children: React.ReactNode
}

export function SettingsStateProvider({ children }: SettingsStateProviderProps) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useMySettings()
  const [settings, setSettings] = useState<UserSettingResponse | null>(null)
  const [pending, setPending] = useState<PendingState>(defaultPending)

  useEffect(() => {
    if (data && !settings) {
      setSettings(data)
    }
  }, [data, settings])

  const syncQueryCache = (next: UserSettingResponse) => {
    queryClient.setQueryData(settingsKeys.mySettings(), next)
  }

  const updateSection = async <K extends keyof PendingState>(
    key: K,
    applyLocal: (prev: UserSettingResponse) => UserSettingResponse,
    apiCall: () => Promise<{ data: { data: UserSettingResponse } }>,
    errorMessage: string
  ) => {
    if (!settings) return

    const previous = settings
    const nextLocal = applyLocal(previous)
    setSettings(nextLocal)
    syncQueryCache(nextLocal)
    setPending((prev) => ({ ...prev, [key]: true }))

    try {
      const response = await apiCall()
      setSettings(response.data.data)
      syncQueryCache(response.data.data)
    } catch {
      setSettings(previous)
      syncQueryCache(previous)
      toast.error(errorMessage)
    } finally {
      setPending((prev) => ({ ...prev, [key]: false }))
    }
  }

  const value: SettingsStateContextValue = {
    settings,
    isLoading,
    pending,
    updateGeneralSettings: async (data) =>
      updateSection(
        'general',
        (prev) => ({ ...prev, generalSettings: data }),
        () => settingsApi.updateGeneralSettings(data),
        'Failed to update general settings'
      ),
    updateSecuritySettings: async (data) =>
      updateSection(
        'security',
        (prev) => ({ ...prev, securitySettings: data }),
        () => settingsApi.updateSecuritySettings(data),
        'Failed to update security settings'
      ),
    updatePrivacySettings: async (data) =>
      updateSection(
        'privacy',
        (prev) => ({ ...prev, privacySettings: data }),
        () => settingsApi.updatePrivacySettings(data),
        'Failed to update privacy settings'
      ),
    updateSyncSettings: async (data) =>
      updateSection(
        'sync',
        (prev) => ({ ...prev, syncSettings: data }),
        () => settingsApi.updateSyncSettings(data),
        'Failed to update sync settings'
      ),
    updateAppearanceSettings: async (data) =>
      updateSection(
        'appearance',
        (prev) => ({ ...prev, appearanceSettings: data }),
        () => settingsApi.updateAppearanceSettings(data),
        'Failed to update appearance settings'
      ),
    updateMessageSettings: async (data) =>
      updateSection(
        'message',
        (prev) => ({ ...prev, messageSettings: data }),
        () => settingsApi.updateMessageSettings(data),
        'Failed to update message settings'
      ),
    updateUtilitiesSettings: async (data) =>
      updateSection(
        'utilities',
        (prev) => ({ ...prev, utilitiesSettings: data }),
        () => settingsApi.updateUtilitiesSettings(data),
        'Failed to update utilities settings'
      )
  }

  return <SettingsStateContext.Provider value={value}>{children}</SettingsStateContext.Provider>
}

export function useSettingsState() {
  const context = useContext(SettingsStateContext)
  if (!context) {
    throw new Error('useSettingsState must be used inside SettingsStateProvider')
  }
  return context
}
