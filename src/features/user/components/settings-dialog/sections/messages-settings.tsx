import { Loader2 } from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { useMySettings, useUpdateMessageSettings } from '@/features/user/queries/use-settings'

export function MessagesSettings() {
  const { text } = useUserText()
  const { data: settings, isLoading } = useMySettings()
  const updateSettings = useUpdateMessageSettings()

  const messageSettings = settings?.messageSettings

  const handleToggle = (field: keyof typeof messageSettings) => {
    if (!messageSettings) return
    updateSettings.mutate({
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

      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-medium text-foreground'>{text.settings.messages.quickResponse.title}</h3>
          <p className='text-xs text-muted-foreground'>{text.settings.messages.quickResponse.description}</p>
        </div>
        <button
          onClick={() => handleToggle('quickResponseEnable')}
          disabled={updateSettings.isPending}
          className={cn(
            'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
            messageSettings.quickResponseEnable ? 'bg-primary' : 'bg-muted'
          )}
        >
          <div
            className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
              messageSettings.quickResponseEnable ? 'translate-x-5' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      <Separator />

      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-medium text-foreground'>
            {text.settings.messages.separatePriorityAndOther.title}
          </h3>
          <p className='text-xs text-muted-foreground'>{text.settings.messages.separatePriorityAndOther.description}</p>
        </div>
        <button
          onClick={() => handleToggle('separatePriorityAndOtherEnable')}
          disabled={updateSettings.isPending}
          className={cn(
            'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
            messageSettings.separatePriorityAndOtherEnable ? 'bg-primary' : 'bg-muted'
          )}
        >
          <div
            className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
              messageSettings.separatePriorityAndOtherEnable ? 'translate-x-5' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      <Separator />

      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-medium text-foreground'>{text.settings.messages.showTypingStatus.title}</h3>
          <p className='text-xs text-muted-foreground'>{text.settings.messages.showTypingStatus.description}</p>
        </div>
        <button
          onClick={() => handleToggle('showTypingStatus')}
          disabled={updateSettings.isPending}
          className={cn(
            'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
            messageSettings.showTypingStatus ? 'bg-primary' : 'bg-muted'
          )}
        >
          <div
            className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
              messageSettings.showTypingStatus ? 'translate-x-5' : 'translate-x-1'
            )}
          />
        </button>
      </div>
    </div>
  )
}
