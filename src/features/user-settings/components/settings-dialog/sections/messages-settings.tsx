import { Loader2 } from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'

import { ActionRow } from './action-row'
import { useSettingsState } from '../settings-state-context'

export function MessagesSettings() {
  const { text } = useUserText()
  const { settings, isLoading, pending, updateMessageSettings } = useSettingsState()

  const messageSettings = settings?.messageSettings

  const handleToggle = (field: keyof NonNullable<typeof messageSettings>) => {
    if (!messageSettings) return
    updateMessageSettings({
      ...messageSettings,
      [field]: !messageSettings[field]
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (!messageSettings) return null

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold text-foreground'>{text.settings.messages.title}</h2>

      <ActionRow
        mode='inline'
        title={text.settings.messages.quickResponse.title}
        description={text.settings.messages.quickResponse.description}
        action={
          <button
            onClick={() => handleToggle('quickResponseEnable')}
            disabled={pending.message}
            className={cn(
              'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
              messageSettings.quickResponseEnable ? 'bg-primary' : 'bg-muted'
            )}
          >
            <div
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                messageSettings.quickResponseEnable ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        }
      />

      <ActionRow
        mode='inline'
        title={text.settings.messages.separatePriorityAndOther.title}
        description={text.settings.messages.separatePriorityAndOther.description}
        action={
          <button
            onClick={() => handleToggle('separatePriorityAndOtherEnable')}
            disabled={pending.message}
            className={cn(
              'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
              messageSettings.separatePriorityAndOtherEnable ? 'bg-primary' : 'bg-muted'
            )}
          >
            <div
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                messageSettings.separatePriorityAndOtherEnable ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        }
      />

      <ActionRow
        mode='inline'
        title={text.settings.messages.showTypingStatus.title}
        description={text.settings.messages.showTypingStatus.description}
        action={
          <button
            onClick={() => handleToggle('showTypingStatus')}
            disabled={pending.message}
            className={cn(
              'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
              messageSettings.showTypingStatus ? 'bg-primary' : 'bg-muted'
            )}
          >
            <div
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                messageSettings.showTypingStatus ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        }
      />
    </div>
  )
}
