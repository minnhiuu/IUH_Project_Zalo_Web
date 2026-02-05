import { Loader2 } from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'
import { useMySettings, useUpdateSecuritySettings } from '@/features/user/queries/use-settings'

export function SecuritySettings() {
  const { text } = useUserText()
  const { data: settings, isLoading } = useMySettings()
  const updateSettings = useUpdateSecuritySettings()

  const twoFactorEnabled = settings?.securitySettings.twoFactorEnabled ?? false

  const handleToggle = () => {
    updateSettings.mutate({
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

      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-medium text-foreground'>{text.settings.security.twoFactor.title}</h3>
          <p className='text-xs text-muted-foreground'>{text.settings.security.twoFactor.description}</p>
        </div>
        <button
          onClick={handleToggle}
          disabled={updateSettings.isPending}
          className={cn(
            'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
            twoFactorEnabled ? 'bg-primary' : 'bg-muted'
          )}
        >
          <div
            className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
              twoFactorEnabled ? 'translate-x-5' : 'translate-x-1'
            )}
          />
        </button>
      </div>
    </div>
  )
}
