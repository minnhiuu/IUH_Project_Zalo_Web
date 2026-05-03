import { Loader2 } from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'
import { useState } from 'react'

import { ActionRow } from './action-row'
import { useSettingsState } from '../settings-state-context'
import { Button } from '@/components/ui/button'
import { type NotificationSettings as NotificationSettingsType } from '@/features/user-settings/schemas/settings.schema'

export function NotificationSettings() {
  const { text } = useUserText()
  const { settings, isLoading, pending, updateNotificationSettings } = useSettingsState()

  // Default settings for new users
  const defaultNotificationSettings: NotificationSettingsType = {
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
      dndTimezone: 'GMT+7',
      activeDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    }
  }

  const notificationSettings = settings?.notificationSettings || defaultNotificationSettings
  const dndServer = notificationSettings.doNotDisturb

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
        dndEnabled: isEnabling
      }
    })
  }

  const handleToggleAllowNotifications = () => {
    updateNotificationSettings({
      ...notificationSettings,
      notifyCall: !notificationSettings.notifyCall
    })
  }

  const handleToggleNotifSound = () => {
    updateNotificationSettings({
      ...notificationSettings,
      notifSound: !notificationSettings.notifSound
    })
  }

  const handleToggleNotifVibration = () => {
    updateNotificationSettings({
      ...notificationSettings,
      notifVibration: !notificationSettings.notifVibration
    })
  }

  const handleToggleNotifFriendRequests = () => {
    updateNotificationSettings({
      ...notificationSettings,
      notifFriendRequests: !notificationSettings.notifFriendRequests
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

        <ActionRow
          mode='inline'
          title={text.settings.notification.vibration.title}
          description={text.settings.notification.vibration.description}
          action={
            <button
              onClick={handleToggleNotifVibration}
              disabled={pending.notification || !notificationSettings.notifyCall}
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
                notificationSettings.notifVibration ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                  notificationSettings.notifVibration ? 'translate-x-5' : 'translate-x-1'
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
              disabled={pending.notification || !notificationSettings.notifyCall}
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
          title={text.settings.notification.quietMode.title}
          description={text.settings.notification.quietMode.description}
          action={
            <button
              onClick={handleToggleDnd}
              disabled={pending.notification}
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

      {dndServer.dndEnabled && (
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

          <div className='space-y-2'>
            <label className='text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground/70'>
              {text.settings.notification.quietMode.timezone}
            </label>
            <select
              value={localDraft.dndTimezone}
              onChange={(e) => setLocalDraft({ ...localDraft, dndTimezone: e.target.value })}
              className='w-full px-3 py-2.5 rounded-lg bg-muted/30 border border-border/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-muted/50'
            >
              <option value='GMT-12:00'>(GMT-12:00) International Date Line West</option>
              <option value='GMT-11:00'>(GMT-11:00) Midway Island, Samoa</option>
              <option value='GMT-10:00'>(GMT-10:00) Hawaii</option>
              <option value='GMT-09:00'>(GMT-09:00) Alaska</option>
              <option value='GMT-08:00'>(GMT-08:00) Pacific Time (US & Canada)</option>
              <option value='GMT-07:00'>(GMT-07:00) Mountain Time (US & Canada)</option>
              <option value='GMT-06:00'>(GMT-06:00) Central Time (US & Canada), Mexico City</option>
              <option value='GMT-05:00'>(GMT-05:00) Eastern Time (US & Canada), Bogota, Lima</option>
              <option value='GMT-04:00'>(GMT-04:00) Atlantic Time (Canada), Caracas, La Paz</option>
              <option value='GMT-03:30'>(GMT-03:30) Newfoundland</option>
              <option value='GMT-03:00'>(GMT-03:00) Brazil, Buenos Aires, Georgetown</option>
              <option value='GMT-02:00'>(GMT-02:00) Mid-Atlantic</option>
              <option value='GMT-01:00'>(GMT-01:00) Azores, Cape Verde Islands</option>
              <option value='GMT+00:00'>(GMT+00:00) Western Europe Time, London, Lisbon, Casablanca</option>
              <option value='GMT+01:00'>(GMT+01:00) Brussels, Copenhagen, Madrid, Paris</option>
              <option value='GMT+02:00'>(GMT+02:00) Kaliningrad, South Africa</option>
              <option value='GMT+03:00'>(GMT+03:00) Baghdad, Riyadh, Moscow, St. Petersburg</option>
              <option value='GMT+03:30'>(GMT+03:30) Tehran</option>
              <option value='GMT+04:00'>(GMT+04:00) Abu Dhabi, Muscat, Baku, Tbilisi</option>
              <option value='GMT+04:30'>(GMT+04:30) Kabul</option>
              <option value='GMT+05:00'>(GMT+05:00) Ekaterinburg, Islamabad, Karachi, Tashkent</option>
              <option value='GMT+05:30'>(GMT+05:30) Bombay, Calcutta, Madras, New Delhi</option>
              <option value='GMT+05:45'>(GMT+05:45) Kathmandu</option>
              <option value='GMT+06:00'>(GMT+06:00) Almaty, Dhaka, Colombo</option>
              <option value='GMT+07:00'>(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
              <option value='GMT+08:00'>(GMT+08:00) Beijing, Perth, Singapore, Hong Kong</option>
              <option value='GMT+09:00'>(GMT+09:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk</option>
              <option value='GMT+09:30'>(GMT+09:30) Adelaide, Darwin</option>
              <option value='GMT+10:00'>(GMT+10:00) Eastern Australia, Guam, Vladivostok</option>
              <option value='GMT+11:00'>(GMT+11:00) Magadan, Solomon Islands, New Caledonia</option>
              <option value='GMT+12:00'>(GMT+12:00) Auckland, Wellington, Fiji, Kamchatka</option>
            </select>
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
