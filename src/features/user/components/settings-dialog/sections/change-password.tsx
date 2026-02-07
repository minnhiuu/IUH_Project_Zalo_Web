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

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
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
    reset
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema)
  })

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
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
            <h2 className='text-lg font-semibold text-foreground'>{text.settings.accountPrivacy.changePassword.title}</h2>
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
              className={cn('pr-10', errors.oldPassword && 'border-red-500')}
            />
            <button
              type='button'
              onClick={() => setShowOldPassword(!showOldPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
            >
              {showOldPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          {errors.oldPassword && <p className='text-xs text-red-500'>{errors.oldPassword.message}</p>}
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
              className={cn('pr-10', errors.newPassword && 'border-red-500')}
            />
            <button
              type='button'
              onClick={() => setShowNewPassword(!showNewPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
            >
              {showNewPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          {errors.newPassword && <p className='text-xs text-red-500'>{errors.newPassword.message}</p>}
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
              className={cn('pr-10', errors.confirmPassword && 'border-red-500')}
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
            >
              {showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          {errors.confirmPassword && <p className='text-xs text-red-500'>{errors.confirmPassword.message}</p>}
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
