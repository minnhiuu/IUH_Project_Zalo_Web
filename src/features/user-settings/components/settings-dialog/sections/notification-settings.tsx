import { Loader2 } from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'
import { useState } from 'react'

import { ActionRow } from './action-row'
import { useSettingsState } from '../settings-state-context'
import { Button } from '@/components/ui/button'
import { type NotificationSettings as NotificationSettingsType } from '@/features/user-settings/schemas/settings.schema'

const DEFAULT_DND_TIMEZONE = 'GMT+07:00'

export function NotificationSettings() {
  const { text } = useUserText()
  const { settings, isLoading, pending, updateNotificationSettings } = useSettingsState()

  // Default settings for new users
  const defaultNotificationSettings: NotificationSettingsType = {
    allowNotifications: true,
    notifSound: true,
    notifVibration: true,
    notifFriendRequests: true,
    notifyNewMessageFromDirect: true,
    previewNewMessageFromDirect: true,
    notifyNewMessageFromGroup: true,
    notifyCall: true,
    notifyNewPostFromFriend: true,
    notifyDOB: true,
    notifyNewMessage: true,
    shakeOnNewMessage: true,
    previewNewMessage: true,
    doNotDisturb: {
      dndEnabled: false,
      dndStartTime: '23:00',
      dndEndTime: '07:00',
      dndTimezone: DEFAULT_DND_TIMEZONE,
      activeDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    }
  }

  const notificationSettings = settings?.notificationSettings || defaultNotificationSettings
  const dndServer = {
    ...notificationSettings.doNotDisturb,
    dndTimezone: DEFAULT_DND_TIMEZONE
  }

  // Local state for the schedule draft
  const [localDraft, setLocalDraft] = useState(dndServer)
  
  // Track previous server value to sync during render (Fixes 'cascading renders' error)
  const [prevServerDndJson, setPrevServerDndJson] = useState(JSON.stringify(dndServer))

  // Sync the draft from server during the render phase if the server data changed
  const currentServerDndJson = JSON.stringify(dndServer)
  if (currentServerDndJson !== prevServerDndJson) {
    setPrevServerDndJson(currentServerDndJson)
    setLocalDraft(dndServer)
  }

  // Check if the current draft is different from what's on the server
  const localDraftJson = JSON.stringify(localDraft)
  const hasChanges = localDraftJson !== currentServerDndJson

  const handleSaveDnd = () => {
    if (!localDraft) return
    updateNotificationSettings({
      ...notificationSettings,
      doNotDisturb: {
        ...localDraft,
        dndTimezone: DEFAULT_DND_TIMEZONE,
        dndEnabled: dndServer.dndEnabled // Keep the current enabled state
      }
    })
  }

  const handleToggleDnd = () => {
    const isEnabling = !dndServer.dndEnabled
    updateNotificationSettings({
      ...notificationSettings,
      doNotDisturb: {
        ...dndServer,
        dndTimezone: DEFAULT_DND_TIMEZONE,
        dndEnabled: isEnabling
      }
    })
  }

  const handleToggleAllowNotifications = () => {
    updateNotificationSettings({
      ...notificationSettings,
      allowNotifications: !notificationSettings.allowNotifications
    })
  }

  const handleToggleNotifSound = () => {
    updateNotificationSettings({
      ...notificationSettings,
      notifSound: !notificationSettings.notifSound
    })
  }


  const handleToggleNotifFriendRequests = () => {
    updateNotificationSettings({
      ...notificationSettings,
      notifFriendRequests: !notificationSettings.notifFriendRequests
    })
  }

  const handleToggleDirectMessages = () => {
    updateNotificationSettings({
      ...notificationSettings,
      notifyNewMessageFromDirect: !notificationSettings.notifyNewMessageFromDirect
    })
  }

  const handleToggleGroupMessages = () => {
    updateNotificationSettings({
      ...notificationSettings,
      notifyNewMessageFromGroup: !notificationSettings.notifyNewMessageFromGroup
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  const dayLabels: Record<string, string> = {
    MONDAY: 'Mo',
    TUESDAY: 'Tu',
    WEDNESDAY: 'We',
    THURSDAY: 'Th',
    FRIDAY: 'Fr',
    SATURDAY: 'Sa',
    SUNDAY: 'Su'
  }

  return (
    <>
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
                notificationSettings.allowNotifications ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                  notificationSettings.allowNotifications ? 'translate-x-5' : 'translate-x-1'
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
              disabled={pending.notification || !notificationSettings.allowNotifications}
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


        <ActionRow
          mode='inline'
          title={text.settings.notification.friendRequests.title}
          description={text.settings.notification.friendRequests.description}
          action={
            <button
              onClick={handleToggleNotifFriendRequests}
              disabled={pending.notification || !notificationSettings.allowNotifications}
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
                notificationSettings.notifFriendRequests ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                  notificationSettings.notifFriendRequests ? 'translate-x-5' : 'translate-x-1'
                )}
              />
            </button>
          }
        />

        <ActionRow
          mode='inline'
          title={text.settings.notification.directMessages.title}
          description={text.settings.notification.directMessages.description}
          action={
            <button
              onClick={handleToggleDirectMessages}
              disabled={pending.notification || !notificationSettings.allowNotifications}
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
                notificationSettings.notifyNewMessageFromDirect ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                  notificationSettings.notifyNewMessageFromDirect ? 'translate-x-5' : 'translate-x-1'
                )}
              />
            </button>
          }
        />

        <ActionRow
          mode='inline'
          title={text.settings.notification.groupMessages.title}
          description={text.settings.notification.groupMessages.description}
          action={
            <button
              onClick={handleToggleGroupMessages}
              disabled={pending.notification || !notificationSettings.allowNotifications}
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
                notificationSettings.notifyNewMessageFromGroup ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                  notificationSettings.notifyNewMessageFromGroup ? 'translate-x-5' : 'translate-x-1'
                )}
              />
            </button>
          }
        />

        <ActionRow
          mode='inline'
          title={text.settings.notification.quietMode.title}
          description={text.settings.notification.quietMode.description}
          action={
            <button
              onClick={handleToggleDnd}
              disabled={pending.notification || !notificationSettings.allowNotifications}
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
                dndServer.dndEnabled ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                  dndServer.dndEnabled ? 'translate-x-5' : 'translate-x-1'
                )}
              />
            </button>
          }
        />
      </div>

      {dndServer.dndEnabled && notificationSettings.allowNotifications && (
        <div className='p-6 mt-4 rounded-xl border border-border/50 bg-card shadow-sm space-y-6 animate-in fade-in slide-in-from-top-2 duration-200'>
          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <label className='text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground/70'>
                {text.settings.notification.quietMode.startTime}
              </label>
              <input
                type='time'
                value={localDraft.dndStartTime}
                onChange={(e) => setLocalDraft({ ...localDraft, dndStartTime: e.target.value })}
                className='w-full px-3 py-2.5 rounded-lg bg-muted/30 border border-border/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-muted/50'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground/70'>
                {text.settings.notification.quietMode.endTime}
              </label>
              <input
                type='time'
                value={localDraft.dndEndTime}
                onChange={(e) => setLocalDraft({ ...localDraft, dndEndTime: e.target.value })}
                className='w-full px-3 py-2.5 rounded-lg bg-muted/30 border border-border/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-muted/50'
              />
            </div>
          </div>

          <div className='space-y-4'>
            <label className='text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground/70'>
              {text.settings.notification.quietMode.chooseDays}
            </label>
            <div className='flex justify-between items-center bg-muted/20 p-2 rounded-2xl border border-border/30'>
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
                const isActive = localDraft.activeDays.includes(day)
                return (
                  <button
                    key={day}
                    onClick={() => {
                      const newDays = isActive
                        ? localDraft.activeDays.filter((d) => d !== day)
                        : [...localDraft.activeDays, day]
                      setLocalDraft({ ...localDraft, activeDays: newDays })
                    }}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold transition-all',
                      isActive 
                        ? 'bg-primary/15 text-primary shadow-sm scale-110' 
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    {dayLabels[day]}
                  </button>
                )
              })}
            </div>
            
            <div className='flex items-center justify-between pt-2'>
              <p className='text-xs text-muted-foreground font-medium'>
                {localDraft.activeDays.length === 7 
                  ? text.settings.notification.quietMode.everyday
                  : text.settings.notification.quietMode.activeDaysCount(localDraft.activeDays.length)}
              </p>
              
              <Button
                variant={hasChanges ? 'default' : 'disabled'}
                onClick={handleSaveDnd}
                disabled={!hasChanges || pending.notification}
                className='px-8 rounded-full font-bold shadow-sm'
              >
                {pending.notification ? (
                  <Loader2 className='w-4 h-4 animate-spin mr-2' />
                ) : null}
                {text.settings.notification.quietMode.save}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
