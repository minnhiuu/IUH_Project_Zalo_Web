import { useState } from 'react'
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useChangePassword } from '@/features/user/queries/use-mutations'
import { toast } from 'sonner'
import { getErrorMessage } from '@/utils/error-handler'
import i18n from '@/lib/i18n'

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, i18n.t('user:user.settings.accountPrivacy.changePassword.validation.currentPasswordRequired')),
    newPassword: z
      .string()
      .min(8, i18n.t('auth:auth.validation.passwordMin'))
      .regex(PASSWORD_COMPLEXITY_REGEX, i18n.t('auth:auth.validation.passwordComplex')),
    confirmPassword: z
      .string()
      .min(1, i18n.t('user:user.settings.accountPrivacy.changePassword.validation.confirmPasswordRequired')),
    logoutOtherDevices: z.boolean()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: i18n.t('auth:auth.validation.passwordMismatch'),
    path: ['confirmPassword']
  })

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

interface ChangePasswordProps {
  onBack?: () => void
}

export function ChangePassword({ onBack }: ChangePasswordProps) {
  const { text } = useUserText()
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const changePasswordMutation = useChangePassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      logoutOtherDevices: true
    }
  })

  const logoutOtherDevices = watch('logoutOtherDevices')

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        logoutOtherDevices: data.logoutOtherDevices
      })
      toast.success(text.settings.accountPrivacy.changePassword.success)
      reset()
      if (onBack) onBack()
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage || text.settings.accountPrivacy.changePassword.error)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <div className='flex items-center gap-3'>
          {onBack && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onBack}
              className='gap-1 px-2 h-8 text-muted-foreground hover:text-foreground shrink-0'
            >
              <ArrowLeft className='w-4 h-4' />
            </Button>
          )}
          <div className='flex-1'>
            <h2 className='text-lg font-semibold text-foreground'>
              {text.settings.accountPrivacy.changePassword.title}
            </h2>
          </div>
        </div>
        <p className='text-xs text-muted-foreground'>{text.settings.accountPrivacy.changePassword.description}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 max-w-md mx-auto'>
        {/* Current Password */}
        <div className='space-y-2'>
          <Label htmlFor='oldPassword' className='text-sm font-medium text-foreground'>
            {text.settings.accountPrivacy.changePassword.currentPasswordLabel}
          </Label>
          <div className='relative'>
            <Input
              id='oldPassword'
              type={showOldPassword ? 'text' : 'password'}
              placeholder={text.settings.accountPrivacy.changePassword.currentPasswordPlaceholder}
              {...register('oldPassword')}
              className={cn('pr-10 bg-white', errors.oldPassword && 'border-destructive')}
            />
            <button
              type='button'
              onClick={() => setShowOldPassword(!showOldPassword)}
              tabIndex={-1}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
            >
              {showOldPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          <p className={cn('text-xs text-destructive min-h-4', !errors.oldPassword && 'invisible')}>
            {errors.oldPassword?.message ?? '.'}
          </p>
        </div>

        {/* New Password */}
        <div className='space-y-2'>
          <Label htmlFor='newPassword' className='text-sm font-medium text-foreground'>
            {text.settings.accountPrivacy.changePassword.newPasswordLabel}
          </Label>
          <div className='relative'>
            <Input
              id='newPassword'
              type={showNewPassword ? 'text' : 'password'}
              placeholder={text.settings.accountPrivacy.changePassword.newPasswordPlaceholder}
              {...register('newPassword')}
              className={cn('pr-10 bg-white', errors.newPassword && 'border-destructive')}
            />
            <button
              type='button'
              onClick={() => setShowNewPassword(!showNewPassword)}
              tabIndex={-1}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
            >
              {showNewPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          <p className={cn('text-xs text-destructive min-h-4', !errors.newPassword && 'invisible')}>
            {errors.newPassword?.message ?? '.'}
          </p>
        </div>

        {/* Confirm Password */}
        <div className='space-y-2'>
          <Label htmlFor='confirmPassword' className='text-sm font-medium text-foreground'>
            {text.settings.accountPrivacy.changePassword.confirmPasswordLabel}
          </Label>
          <div className='relative'>
            <Input
              id='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={text.settings.accountPrivacy.changePassword.confirmPasswordPlaceholder}
              {...register('confirmPassword')}
              className={cn('pr-10 bg-white', errors.confirmPassword && 'border-destructive')}
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
            >
              {showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          <p className={cn('text-xs text-destructive min-h-4', !errors.confirmPassword && 'invisible')}>
            {errors.confirmPassword?.message ?? '.'}
          </p>
        </div>

        <div className='flex items-center justify-between py-2'>
          <Label htmlFor='logoutOtherDevices' className='text-sm font-medium text-foreground cursor-pointer'>
            {text.settings.accountPrivacy.changePassword.logoutOtherSessions}
          </Label>
          <button
            type='button'
            role='switch'
            aria-checked={logoutOtherDevices}
            onClick={() => setValue('logoutOtherDevices', !logoutOtherDevices)}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              logoutOtherDevices ? 'bg-primary' : 'bg-muted'
            )}
          >
            <span
              aria-hidden='true'
              className={cn(
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out',
                logoutOtherDevices ? 'translate-x-4' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        <div className='pt-2'>
          <Button type='submit' disabled={changePasswordMutation.isPending} className='w-full'>
            {changePasswordMutation.isPending ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                {text.settings.accountPrivacy.changePassword.changing}
              </>
            ) : (
              text.settings.accountPrivacy.changePassword.changeButton
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
