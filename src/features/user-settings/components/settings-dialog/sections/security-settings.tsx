import { Loader2 } from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'
import { ActionRow } from './action-row'
import { useSettingsState } from '../settings-state-context'

export function SecuritySettings() {
  const { text } = useUserText()
  const { settings, isLoading, pending, updateSecuritySettings } = useSettingsState()

  const twoFactorEnabled = settings?.securitySettings.twoFactorEnabled ?? false

  const handleToggle = () => {
    updateSecuritySettings({
      twoFactorEnabled: !twoFactorEnabled
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold text-foreground'>{text.settings.security.title}</h2>

      <ActionRow
        mode='inline'
        title={text.settings.security.twoFactor.title}
        description={text.settings.security.twoFactor.description}
        action={
          <button
            onClick={handleToggle}
            disabled={pending.security}
            className={cn(
              'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
              twoFactorEnabled ? 'bg-primary' : 'bg-muted'
            )}
          >
            <div
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                twoFactorEnabled ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        }
      />
    </div>
  )
}
