import { Loader2 } from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'

import { ActionRow } from './action-row'
import { useSettingsState } from '../settings-state-context'

export function NotificationSettings() {
  const { text } = useUserText()
  const { settings, isLoading, pending, updateNotificationSettings } = useSettingsState()

  const notificationSettings = settings?.notificationSettings

  const handleToggleAllowNotifications = () => {
    if (!notificationSettings) return
    updateNotificationSettings({
      ...notificationSettings,
      notifyCall: !notificationSettings.notifyCall
    })
  }

  const handleToggleNotifSound = () => {
    if (!notificationSettings) return
    updateNotificationSettings({
      ...notificationSettings,
      notifSound: !notificationSettings.notifSound
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (!notificationSettings) return null

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold text-foreground'>{text.settings.notification.title}</h2>

      <ActionRow
        mode='inline'
        title={text.settings.notification.allowNotifications.title}
        description={text.settings.notification.allowNotifications.description}
        action={
          <button
            onClick={handleToggleAllowNotifications}
            disabled={pending.notification}
            className={cn(
              'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
              notificationSettings.notifyCall ? 'bg-primary' : 'bg-muted'
            )}
          >
            <div
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                notificationSettings.notifyCall ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        }
      />

      <ActionRow
        mode='inline'
        title={text.settings.notification.sound.title}
        description={text.settings.notification.sound.description}
        action={
          <button
            onClick={handleToggleNotifSound}
            disabled={pending.notification || !notificationSettings.notifyCall}
            className={cn(
              'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
              notificationSettings.notifSound ? 'bg-primary' : 'bg-muted'
            )}
          >
            <div
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                notificationSettings.notifSound ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        }
      />
    </div>
  )
}
