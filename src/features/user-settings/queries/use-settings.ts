import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/features/user-settings/api/settings.api'
import type {
  GeneralSettingsUpdateRequest,
  SecuritySettingsUpdateRequest,
  PrivacySettingsUpdateRequest,
  SyncSettingsUpdateRequest,
  AppearanceSettingsUpdateRequest,
  MessageSettingsUpdateRequest,
  NotificationSettingsUpdateRequest,
  UtilitiesSettingsUpdateRequest,
  UserSettingResponse
} from '@/features/user-settings/schemas/settings.schema'
import { toast } from 'sonner'

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  mySettings: () => [...settingsKeys.all, 'me'] as const,
  general: () => [...settingsKeys.all, 'general'] as const,
  privacy: () => [...settingsKeys.all, 'privacy'] as const,
  notification: () => [...settingsKeys.all, 'notification'] as const
}

// Hook to fetch all user settings
export const useMySettings = () => {
  return useQuery({
    queryKey: settingsKeys.mySettings(),
    queryFn: async () => {
      const response = await settingsApi.getMySettings()
      return response.data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })
}

// Hook to update general settings
export const useUpdateGeneralSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GeneralSettingsUpdateRequest) => settingsApi.updateGeneralSettings(data),
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: settingsKeys.mySettings() })

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData(settingsKeys.mySettings())

      // Optimistically update to the new value
      queryClient.setQueryData(settingsKeys.mySettings(), (old: UserSettingResponse | undefined) => {
        if (!old) return old
        return {
          ...old,
          generalSettings: newData
        }
      })

      return { previousSettings }
    },
    onError: (_err, _newData, context) => {
      // Rollback on error
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsKeys.mySettings(), context.previousSettings)
      }
      toast.error('Failed to update general settings')
    },
    onSuccess: (response) => {
      // Update the cache with the server response
      queryClient.setQueryData(settingsKeys.mySettings(), response.data.data)
      toast.success('General settings updated successfully')
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: settingsKeys.mySettings() })
    }
  })
}

// Hook to update security settings
export const useUpdateSecuritySettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SecuritySettingsUpdateRequest) => settingsApi.updateSecuritySettings(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.mySettings() })
      const previousSettings = queryClient.getQueryData(settingsKeys.mySettings())

      queryClient.setQueryData(settingsKeys.mySettings(), (old: UserSettingResponse | undefined) => {
        if (!old) return old
        return {
          ...old,
          securitySettings: newData
        }
      })

      return { previousSettings }
    },
    onError: (_err, _newData, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsKeys.mySettings(), context.previousSettings)
      }
      toast.error('Failed to update security settings')
    },
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.mySettings(), response.data.data)
      toast.success('Security settings updated successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.mySettings() })
    }
  })
}

// Hook to update privacy settings
export const useUpdatePrivacySettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PrivacySettingsUpdateRequest) => settingsApi.updatePrivacySettings(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.mySettings() })
      const previousSettings = queryClient.getQueryData(settingsKeys.mySettings())

      queryClient.setQueryData(settingsKeys.mySettings(), (old: UserSettingResponse | undefined) => {
        if (!old) return old
        return {
          ...old,
          privacySettings: newData
        }
      })

      return { previousSettings }
    },
    onError: (_err, _newData, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsKeys.mySettings(), context.previousSettings)
      }
      toast.error('Failed to update privacy settings')
    },
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.mySettings(), response.data.data)
      toast.success('Privacy settings updated successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.mySettings() })
    }
  })
}

// Hook to update sync settings
export const useUpdateSyncSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SyncSettingsUpdateRequest) => settingsApi.updateSyncSettings(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.mySettings() })
      const previousSettings = queryClient.getQueryData(settingsKeys.mySettings())

      queryClient.setQueryData(settingsKeys.mySettings(), (old: UserSettingResponse | undefined) => {
        if (!old) return old
        return {
          ...old,
          syncSettings: newData
        }
      })

      return { previousSettings }
    },
    onError: (_err, _newData, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsKeys.mySettings(), context.previousSettings)
      }
      toast.error('Failed to update sync settings')
    },
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.mySettings(), response.data.data)
      toast.success('Sync settings updated successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.mySettings() })
    }
  })
}

// Hook to update appearance settings
export const useUpdateAppearanceSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AppearanceSettingsUpdateRequest) => settingsApi.updateAppearanceSettings(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.mySettings() })
      const previousSettings = queryClient.getQueryData(settingsKeys.mySettings())

      queryClient.setQueryData(settingsKeys.mySettings(), (old: UserSettingResponse | undefined) => {
        if (!old) return old
        return {
          ...old,
          appearanceSettings: newData
        }
      })

      return { previousSettings }
    },
    onError: (_err, _newData, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsKeys.mySettings(), context.previousSettings)
      }
      toast.error('Failed to update appearance settings')
    },
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.mySettings(), response.data.data)
      toast.success('Appearance settings updated successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.mySettings() })
    }
  })
}

// Hook to update message settings
export const useUpdateMessageSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MessageSettingsUpdateRequest) => settingsApi.updateMessageSettings(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.mySettings() })
      const previousSettings = queryClient.getQueryData(settingsKeys.mySettings())

      queryClient.setQueryData(settingsKeys.mySettings(), (old: UserSettingResponse | undefined) => {
        if (!old) return old
        return {
          ...old,
          messageSettings: newData
        }
      })

      return { previousSettings }
    },
    onError: (_err, _newData, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsKeys.mySettings(), context.previousSettings)
      }
      toast.error('Failed to update message settings')
    },
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.mySettings(), response.data.data)
      toast.success('Message settings updated successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.mySettings() })
    }
  })
}

// Hook to update notification settings
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: NotificationSettingsUpdateRequest) => settingsApi.updateNotificationSettings(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.mySettings() })
      const previousSettings = queryClient.getQueryData(settingsKeys.mySettings())

      queryClient.setQueryData(settingsKeys.mySettings(), (old: UserSettingResponse | undefined) => {
        if (!old) return old
        return {
          ...old,
          notificationSettings: newData
        }
      })

      return { previousSettings }
    },
    onError: (_err, _newData, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsKeys.mySettings(), context.previousSettings)
      }
      toast.error('Failed to update notification settings')
    },
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.mySettings(), response.data.data)
      toast.success('Notification settings updated successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.mySettings() })
    }
  })
}

// Hook to update utilities settings
export const useUpdateUtilitiesSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UtilitiesSettingsUpdateRequest) => settingsApi.updateUtilitiesSettings(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.mySettings() })
      const previousSettings = queryClient.getQueryData(settingsKeys.mySettings())

      queryClient.setQueryData(settingsKeys.mySettings(), (old: UserSettingResponse | undefined) => {
        if (!old) return old
        return {
          ...old,
          utilitiesSettings: newData
        }
      })

      return { previousSettings }
    },
    onError: (_err, _newData, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsKeys.mySettings(), context.previousSettings)
      }
      toast.error('Failed to update utilities settings')
    },
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.mySettings(), response.data.data)
      toast.success('Utilities settings updated successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.mySettings() })
    }
  })
}

// Hook to reset settings to defaults
export const useResetSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => settingsApi.resetToDefaults(),
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.mySettings(), response.data.data)
      toast.success('Settings reset to defaults')
    },
    onError: () => {
      toast.error('Failed to reset settings')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.mySettings() })
    }
  })
}
