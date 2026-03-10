import { Loader2 } from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'

import { ActionRow } from './action-row'
import { useSettingsState } from '../settings-state-context'

export function SyncSettings() {
  const { text } = useUserText()
  const { settings, isLoading, pending, updateSyncSettings } = useSettingsState()

  const syncSettings = settings?.syncSettings

  const handleToggle = (field: 'syncSuggestion' | 'showSyncProgress') => {
    if (!syncSettings) return
    updateSyncSettings({
      ...syncSettings,
      [field]: !syncSettings[field]
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (!syncSettings) return null

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold text-foreground'>{text.settings.sync.title}</h2>

      <ActionRow
        mode='inline'
        title={text.settings.sync.syncSuggestion.title}
        description={text.settings.sync.syncSuggestion.description}
        action={
          <button
            onClick={() => handleToggle('syncSuggestion')}
            disabled={pending.sync}
            className={cn(
              'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
              syncSettings.syncSuggestion ? 'bg-primary' : 'bg-muted'
            )}
          >
            <div
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                syncSettings.syncSuggestion ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        }
      />

      <ActionRow
        mode='inline'
        title={text.settings.sync.showSyncProgress.title}
        description={text.settings.sync.showSyncProgress.description}
        action={
          <button
            onClick={() => handleToggle('showSyncProgress')}
            disabled={pending.sync}
            className={cn(
              'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
              syncSettings.showSyncProgress ? 'bg-primary' : 'bg-muted'
            )}
          >
            <div
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                syncSettings.showSyncProgress ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        }
      />
    </div>
  )
}
