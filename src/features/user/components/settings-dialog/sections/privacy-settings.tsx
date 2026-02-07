import { Check, Loader2 } from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMySettings, useUpdatePrivacySettings } from '@/features/user/queries/use-settings'
import { PrivacyLevel, DobVisibility } from '@/features/user/schemas/settings.schema'

export function PrivacySettings() {
  const { text } = useUserText()
  const { data: settings, isLoading } = useMySettings()
  const updateSettings = useUpdatePrivacySettings()

  const privacySettings = settings?.privacySettings

  const handleToggle = (field: keyof typeof privacySettings) => {
    if (!privacySettings) return
    updateSettings.mutate({
      ...privacySettings,
      [field]: !privacySettings[field]
    })
  }

  const handleDobVisibilityChange = (value: DobVisibility) => {
    if (!privacySettings) return
    updateSettings.mutate({
      ...privacySettings,
      showDob: value
    })
  }

  const handlePrivacyLevelChange = (field: 'canText' | 'canCall', value: PrivacyLevel) => {
    if (!privacySettings) return
    updateSettings.mutate({
      ...privacySettings,
      [field]: value
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (!privacySettings) return null

  const privacyOptions: { value: PrivacyLevel; label: string }[] = [
    { value: PrivacyLevel.EVERYBODY, label: text.settings.privacy.textAndCall.canText.everybody },
    { value: PrivacyLevel.FRIENDS, label: text.settings.privacy.textAndCall.canText.friends },
    { value: PrivacyLevel.CONTACTED, label: text.settings.privacy.textAndCall.canText.contacted }
  ]

  const dobVisibilityOptions: { value: DobVisibility; label: string }[] = [
    { value: DobVisibility.HIDDEN, label: text.settings.privacy.personal.showDob.hidden },
    { value: DobVisibility.FULL_DATE, label: text.settings.privacy.personal.showDob.fullDate },
    { value: DobVisibility.MONTH_DAY_ONLY, label: text.settings.privacy.personal.showDob.monthDayOnly }
  ]

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold text-foreground'>{text.settings.privacy.title}</h2>

      {/* Personal Information Section */}
      <div className='space-y-3'>
        <h3 className='text-base font-medium text-foreground'>{text.settings.privacy.personal.title}</h3>
        <div className='rounded-lg border p-4 space-y-4'>
          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-foreground'>{text.settings.privacy.personal.showDob.title}</h4>
            <p className='text-xs text-muted-foreground'>{text.settings.privacy.personal.showDob.description}</p>
            <Select
              value={privacySettings.showDob}
              onValueChange={(value) => handleDobVisibilityChange(value as DobVisibility)}
              disabled={updateSettings.isPending}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent side='bottom' align='start' position='popper' sideOffset={4} className='bg-popover'>
                <SelectItem value={DobVisibility.HIDDEN}>{text.settings.privacy.personal.showDob.hidden}</SelectItem>
                <SelectItem value={DobVisibility.FULL_DATE}>{text.settings.privacy.personal.showDob.fullDate}</SelectItem>
                <SelectItem value={DobVisibility.MONTH_DAY_ONLY}>
                  {text.settings.privacy.personal.showDob.monthDayOnly}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <h4 className='text-sm font-medium text-foreground'>
                {text.settings.privacy.personal.showActiveStatus.title}
              </h4>
              <p className='text-xs text-muted-foreground'>
                {text.settings.privacy.personal.showActiveStatus.description}
              </p>
            </div>
            <button
              onClick={() => handleToggle('showActiveStatus')}
              disabled={updateSettings.isPending}
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
                privacySettings.showActiveStatus ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                  privacySettings.showActiveStatus ? 'translate-x-5' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Text and Call Section */}
      <div className='space-y-3'>
        <h3 className='text-base font-medium text-foreground'>{text.settings.privacy.textAndCall.title}</h3>
        <div className='rounded-lg border p-4 space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='text-sm font-medium text-foreground'>
                {text.settings.privacy.textAndCall.showReadStatus.title}
              </h4>
              <p className='text-xs text-muted-foreground'>
                {text.settings.privacy.textAndCall.showReadStatus.description}
              </p>
            </div>
            <button
              onClick={() => handleToggle('showReadStatus')}
              disabled={updateSettings.isPending}
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
                privacySettings.showReadStatus ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                  privacySettings.showReadStatus ? 'translate-x-5' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          <Separator />

          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-foreground'>{text.settings.privacy.textAndCall.canText.title}</h4>
            <div className='space-y-1'>
              {privacyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePrivacyLevelChange('canText', option.value)}
                  disabled={updateSettings.isPending}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed',
                    privacySettings.canText === option.value && 'bg-muted'
                  )}
                >
                  <span>{option.label}</span>
                  {privacySettings.canText === option.value && <Check className='w-4 h-4 text-primary' />}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-foreground'>{text.settings.privacy.textAndCall.canCall.title}</h4>
            <div className='space-y-1'>
              {privacyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePrivacyLevelChange('canCall', option.value)}
                  disabled={updateSettings.isPending}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed',
                    privacySettings.canCall === option.value && 'bg-muted'
                  )}
                >
                  <span>{option.label}</span>
                  {privacySettings.canCall === option.value && <Check className='w-4 h-4 text-primary' />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Search Section */}
      <div className='space-y-3'>
        <h3 className='text-base font-medium text-foreground'>{text.settings.privacy.search.title}</h3>
        <div className='rounded-lg border p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='text-sm font-medium text-foreground'>
                {text.settings.privacy.search.allowSearchOnPhoneNumber.title}
              </h4>
              <p className='text-xs text-muted-foreground'>
                {text.settings.privacy.search.allowSearchOnPhoneNumber.description}
              </p>
            </div>
            <button
              onClick={() => handleToggle('allowSearchOnPhoneNumber')}
              disabled={updateSettings.isPending}
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
                privacySettings.allowSearchOnPhoneNumber ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                  privacySettings.allowSearchOnPhoneNumber ? 'translate-x-5' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
