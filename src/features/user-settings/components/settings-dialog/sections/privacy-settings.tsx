import { useState } from 'react'
import {
  Check,
  Loader2,
  Smartphone,
  ChevronRight,
  KeyRound,
  Ban,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX
} from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PrivacyLevel, DobVisibility } from '@/features/user-settings/schemas/settings.schema'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { ActionRow } from './action-row'
import { useSettingsState } from '../settings-state-context'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { useActivateAccountMutation, useDeactivateAccountMutation } from '@/features/user/queries/use-mutations'

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
  const { user } = useAuthContext()
  const [confirmAction, setConfirmAction] = useState<'deactivate' | 'activate' | null>(null)
  const deactivateAccountMutation = useDeactivateAccountMutation()
  const activateAccountMutation = useActivateAccountMutation()

  const privacySettings = settings?.privacySettings
  const isPrivacyAvailable = !!privacySettings
  const isAccountActive = user?.active === true
  const isActivationPending = deactivateAccountMutation.isPending || activateAccountMutation.isPending

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

  const handleConfirmAccountAction = async () => {
    if (!confirmAction) return

    try {
      if (confirmAction === 'deactivate') {
        await deactivateAccountMutation.mutateAsync()
        toast.success(text.settings.accountPrivacy.accountActivation.deactivateSuccess)
      } else {
        await activateAccountMutation.mutateAsync()
        toast.success(text.settings.accountPrivacy.accountActivation.activateSuccess)
      }
      setConfirmAction(null)
    } catch {
      toast.error(text.settings.accountPrivacy.accountActivation.error)
    }
  }

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
          <ActionRow title={text.settings.privacy.search.title} contentClassName='space-y-0'>
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
                disabled={pending.privacy}
                className={cn(
                  'w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed',
                  privacySettings.allowSearchOnPhoneNumber ? 'bg-primary' : 'bg-muted'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm transition-transform',
                    privacySettings.allowSearchOnPhoneNumber ? 'translate-x-5' : 'translate-x-1'
                  )}
                />
              </button>
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

        {/* Account Activation Section */}
        <ActionRow title={text.settings.accountPrivacy.accountActivation.title} contentClassName='space-y-4'>
          <div
            className={cn(
              'rounded-xl border px-4 py-3',
              isAccountActive
                ? 'border-destructive/25 bg-destructive-subtle/40'
                : 'border-emerald-500/25 bg-emerald-500/10 dark:bg-emerald-500/15'
            )}
          >
            <div className='flex items-start gap-3'>
              <div
                className={cn(
                  'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full',
                  isAccountActive
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                )}
              >
                {isAccountActive ? <ShieldAlert className='h-4 w-4' /> : <ShieldCheck className='h-4 w-4' />}
              </div>

              <div className='space-y-1'>
                <p className='text-sm font-semibold text-foreground'>
                  {isAccountActive
                    ? text.settings.accountPrivacy.accountActivation.deactivateButton
                    : text.settings.accountPrivacy.accountActivation.activateButton}
                </p>
                <p className='text-xs leading-relaxed text-muted-foreground'>
                  {isAccountActive
                    ? text.settings.accountPrivacy.accountActivation.activeDescription
                    : text.settings.accountPrivacy.accountActivation.inactiveDescription}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setConfirmAction(isAccountActive ? 'deactivate' : 'activate')}
            disabled={isActivationPending}
            variant={isAccountActive ? 'destructive' : 'secondary-blue'}
            className='w-full sm:w-fit'
          >
            {isAccountActive ? <UserX className='w-4 h-4 mr-2' /> : <UserCheck className='w-4 h-4 mr-2' />}
            {isAccountActive
              ? text.settings.accountPrivacy.accountActivation.deactivateButton
              : text.settings.accountPrivacy.accountActivation.activateButton}
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

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent size='sm'>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'deactivate'
                ? text.settings.accountPrivacy.accountActivation.deactivateConfirmTitle
                : text.settings.accountPrivacy.accountActivation.activateConfirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'deactivate'
                ? text.settings.accountPrivacy.accountActivation.deactivateConfirmDescription
                : text.settings.accountPrivacy.accountActivation.activateConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActivationPending}>{text.profile.cancel}</AlertDialogCancel>
            <Button
              type='button'
              variant={confirmAction === 'deactivate' ? 'destructive' : 'secondary-blue'}
              onClick={handleConfirmAccountAction}
              disabled={isActivationPending}
            >
              {isActivationPending ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  {confirmAction === 'deactivate'
                    ? text.settings.accountPrivacy.accountActivation.deactivating
                    : text.settings.accountPrivacy.accountActivation.activating}
                </>
              ) : confirmAction === 'deactivate' ? (
                text.settings.accountPrivacy.accountActivation.deactivateButton
              ) : (
                text.settings.accountPrivacy.accountActivation.activateButton
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
