import { Check, Loader2, Smartphone, ChevronRight, KeyRound, Ban } from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PrivacyLevel, DobVisibility, SearchVisibility } from '@/features/user-settings/schemas/settings.schema'
import { Button } from '@/components/ui/button'
import { ActionRow } from './action-row'
import { useSettingsState } from '../settings-state-context'

interface PrivacySettingsProps {
  onNavigateToDevices?: () => void
  onNavigateToChangePassword?: () => void
  onNavigateToBlockedUsers?: () => void
}

export function PrivacySettings({
  onNavigateToDevices,
  onNavigateToChangePassword,
  onNavigateToBlockedUsers
}: PrivacySettingsProps) {
  const { text } = useUserText()
  const { settings, isLoading, pending, updatePrivacySettings } = useSettingsState()

  const privacySettings = settings?.privacySettings
  const isPrivacyAvailable = !!privacySettings

  const handleToggle = (field: keyof NonNullable<typeof privacySettings>) => {
    if (!privacySettings) return
    updatePrivacySettings({
      ...privacySettings,
      [field]: !privacySettings[field]
    })
  }

  const handleDobVisibilityChange = (value: DobVisibility) => {
    if (!privacySettings) return
    updatePrivacySettings({
      ...privacySettings,
      showDob: value
    })
  }

  const handlePrivacyLevelChange = (field: 'canText' | 'canCall', value: PrivacyLevel) => {
    if (!privacySettings) return
    updatePrivacySettings({
      ...privacySettings,
      [field]: value
    })
  }

  const handleSearchVisibilityChange = (
    field: 'nameSearchVisibility' | 'phoneSearchVisibility',
    value: SearchVisibility
  ) => {
    if (!privacySettings) return
    updatePrivacySettings({
      ...privacySettings,
      [field]: field === 'nameSearchVisibility' && value === SearchVisibility.NONE ? SearchVisibility.PUBLIC : value
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  const privacyOptions: { value: PrivacyLevel; label: string }[] = [
    { value: PrivacyLevel.EVERYONE, label: text.settings.privacy.textAndCall.canText.everybody },
    { value: PrivacyLevel.FRIENDS, label: text.settings.privacy.textAndCall.canText.friends },
    { value: PrivacyLevel.FRIENDS_AND_CONTACTED, label: text.settings.privacy.textAndCall.canText.contacted }
  ]

  const nameSearchVisibilityOptions: { value: SearchVisibility; label: string }[] = [
    { value: SearchVisibility.PUBLIC, label: text.settings.privacy.search.visibility.public },
    {
      value: SearchVisibility.FRIENDS_OF_FRIENDS,
      label: text.settings.privacy.search.visibility.friendsOfFriends
    },
    { value: SearchVisibility.FRIENDS_ONLY, label: text.settings.privacy.search.visibility.friendsOnly }
  ]

  const phoneSearchVisibilityOptions: { value: SearchVisibility; label: string }[] = [
    ...nameSearchVisibilityOptions,
    { value: SearchVisibility.NONE, label: text.settings.privacy.search.visibility.none }
  ]

  return (
    <div className='space-y-4'>
      {isPrivacyAvailable && (
        <>
          <h2 className='text-lg font-semibold text-foreground'>{text.settings.privacy.title}</h2>

          {/* Personal Information Section */}
          <ActionRow title={text.settings.privacy.personal.title} contentClassName='space-y-4'>
            <div className='space-y-2'>
              <h4 className='text-sm font-medium text-foreground'>{text.settings.privacy.personal.showDob.title}</h4>
              <p className='text-xs text-muted-foreground'>{text.settings.privacy.personal.showDob.description}</p>
              <Select
                value={privacySettings.showDob}
                onValueChange={(value) => handleDobVisibilityChange(value as DobVisibility)}
                disabled={pending.privacy}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side='bottom' align='start' position='popper' sideOffset={4} className='bg-popover'>
                  <SelectItem value={DobVisibility.HIDDEN}>{text.settings.privacy.personal.showDob.hidden}</SelectItem>
                  <SelectItem value={DobVisibility.FULL_DATE}>
                    {text.settings.privacy.personal.showDob.fullDate}
                  </SelectItem>
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
                disabled={pending.privacy}
                className={cn(
                  'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
                  privacySettings.showActiveStatus ? 'bg-primary' : 'bg-muted'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                    privacySettings.showActiveStatus ? 'translate-x-5' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </ActionRow>

          <Separator />

          {/* Text and Call Section */}
          <ActionRow title={text.settings.privacy.textAndCall.title} contentClassName='space-y-4'>
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
                disabled={pending.privacy}
                className={cn(
                  'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
                  privacySettings.showReadStatus ? 'bg-primary' : 'bg-muted'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
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
                    disabled={pending.privacy}
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
                    disabled={pending.privacy}
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
          </ActionRow>

          <Separator />

          {/* Search Section */}
          <ActionRow title={text.settings.privacy.search.title} contentClassName='space-y-4'>
            <div className='space-y-2'>
              <h4 className='text-sm font-medium text-foreground'>
                {text.settings.privacy.search.nameSearchVisibility.title}
              </h4>
              <p className='text-xs text-muted-foreground'>
                {text.settings.privacy.search.nameSearchVisibility.description}
              </p>
              <Select
                value={privacySettings.nameSearchVisibility}
                onValueChange={(value) =>
                  handleSearchVisibilityChange('nameSearchVisibility', value as SearchVisibility)
                }
                disabled={pending.privacy}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side='bottom' align='start' position='popper' sideOffset={4} className='bg-popover'>
                  {nameSearchVisibilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className='space-y-2'>
              <h4 className='text-sm font-medium text-foreground'>
                {text.settings.privacy.search.phoneSearchVisibility.title}
              </h4>
              <p className='text-xs text-muted-foreground'>
                {text.settings.privacy.search.phoneSearchVisibility.description}
              </p>
              <Select
                value={privacySettings.phoneSearchVisibility}
                onValueChange={(value) =>
                  handleSearchVisibilityChange('phoneSearchVisibility', value as SearchVisibility)
                }
                disabled={pending.privacy}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side='bottom' align='start' position='popper' sideOffset={4} className='bg-popover'>
                  {phoneSearchVisibilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ActionRow>

          <Separator />
        </>
      )}

      <div className='space-y-4'>
        <h2 className='text-lg font-semibold text-foreground'>{text.settings.accountPrivacy.title}</h2>

        {/* Change Password Section */}
        <ActionRow
          title={text.settings.accountPrivacy.changePassword.title}
          description={text.settings.accountPrivacy.changePassword.description}
          contentClassName='space-y-4'
        >
          <Button onClick={onNavigateToChangePassword} variant='outline' className='w-full'>
            <KeyRound className='w-4 h-4 mr-2' />
            {text.settings.accountPrivacy.changePassword.changeButton}
            <ChevronRight className='w-4 h-4 ml-auto' />
          </Button>
        </ActionRow>

        <Separator />

        {/* Device Management Section */}
        <ActionRow
          title={text.settings.accountPrivacy.deviceManagement.title}
          description={text.settings.accountPrivacy.deviceManagement.description}
          contentClassName='space-y-4'
        >
          <Button onClick={onNavigateToDevices} variant='outline' className='w-full'>
            <Smartphone className='w-4 h-4 mr-2' />
            {text.settings.accountPrivacy.deviceManagement.showAllButton}
            <ChevronRight className='w-4 h-4 ml-auto' />
          </Button>
        </ActionRow>

        <Separator />

        {/* Blocked Users Section */}
        <ActionRow
          title={text.settings.accountPrivacy.blockedUsers.title}
          description={text.settings.accountPrivacy.blockedUsers.description}
          contentClassName='space-y-4'
        >
          <Button onClick={onNavigateToBlockedUsers} variant='outline' className='w-full'>
            <Ban className='w-4 h-4 mr-2' />
            {text.settings.accountPrivacy.blockedUsers.showAllButton}
            <ChevronRight className='w-4 h-4 ml-auto' />
          </Button>
        </ActionRow>
      </div>
    </div>
  )
}
