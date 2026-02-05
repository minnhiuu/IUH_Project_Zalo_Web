import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ChevronLeft, Lock, KeyRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import {
  type ForgotPasswordRequest,
  forgotPasswordRequestSchema,
  type ResetPasswordRequest,
  resetPasswordRequestSchema
} from '@/features/auth/schemas/auth.schema'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'
import { PATHS } from '@/constants'
import { AuthInput } from './common/auth-input'
import { AuthButton } from './common/auth-button'
import { useForgotPasswordMutation, useResetPasswordMutation } from '../queries/use-mutations'
import { handleErrorApi } from '@/utils/error-handler'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Field, FieldError } from '@/components/ui/field'
import { toast } from 'sonner'

type Step = 'REQUEST' | 'RESET'

export function ForgotPasswordForm() {
  const { loginSuccess } = useAuth()
  const { text } = useAuthText()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('REQUEST')
  const [email, setEmail] = useState('')

  const requestForm = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    mode: 'onChange',
    defaultValues: { email: '' }
  })

  const resetForm = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordRequestSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const forgotPasswordMutation = useForgotPasswordMutation()
  const resetPasswordMutation = useResetPasswordMutation()

  const onHandleRequest = async (data: ForgotPasswordRequest) => {
    try {
      await forgotPasswordMutation.mutateAsync(data)
      setEmail(data.email)
      resetForm.setValue('email', data.email)
      setStep('RESET')
    } catch (error) {
      handleErrorApi({ error, setError: requestForm.setError })
    }
  }

  const onHandleReset = async (data: ResetPasswordRequest) => {
    try {
      const result = await resetPasswordMutation.mutateAsync(data)
      const { accessToken } = result.data.data!
      await loginSuccess(accessToken)
      navigate(PATHS.HOME)
      toast.success(text.forgotPassword.success)
    } catch (error) {
      handleErrorApi({ error, setError: resetForm.setError })
    }
  }

  const isRequestStep = step === 'REQUEST'

  return (
    <div className='w-full max-w-[450px] bg-white dark:bg-card shadow-[0_8px_28px_rgba(0,0,0,0.06)] dark:shadow-none rounded-xl overflow-hidden border-none transition-all animate-in fade-in zoom-in-95 duration-300'>
      <div className='text-center py-4 bg-white dark:bg-card'>
        <p className='text-[16px] font-semibold text-foreground tracking-tight'>{text.form.forgot}</p>
      </div>

      <div className='h-px bg-gray-100 dark:bg-border/50 mx-auto w-full' />

      <div className='p-10 bg-white dark:bg-card flex flex-col items-center'>
        <p className='text-[15px] font-normal text-foreground mb-8 text-center whitespace-pre-line'>
          {isRequestStep
            ? text.forgotPassword.instruction
            : text.forgotPassword.resetInstruction.replace('{{email}}', email)}
        </p>

        {isRequestStep ? (
          <form onSubmit={requestForm.handleSubmit(onHandleRequest)} className='w-full space-y-6 px-5'>
            <AuthInput
              {...requestForm.register('email')}
              icon={Mail}
              placeholder={text.forgotPassword.email}
              error={requestForm.formState.touchedFields.email ? requestForm.formState.errors.email : undefined}
            />

            <div className='pt-2'>
              <AuthButton
                isLoading={forgotPasswordMutation.isPending}
                loadingText={text.form.submitting}
                disabled={!requestForm.formState.isValid}
              >
                {text.forgotPassword.continue}
              </AuthButton>
            </div>
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(onHandleReset)} className='w-full space-y-6 px-5'>
            <div className='w-full flex flex-col items-center space-y-4 mb-4'>
              <div className='flex items-center justify-center gap-2 text-muted-foreground/80'>
                <KeyRound className='h-4 w-4' strokeWidth={2} />
                <span className='text-[14px] font-medium'>{text.forgotPassword.otp}</span>
              </div>
              <Controller
                name='otp'
                control={resetForm.control}
                render={({ field }) => (
                  <Field className='w-full items-center'>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup className='gap-2'>
                        {[...Array(6)].map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className='size-11 text-lg rounded-lg border border-input shadow-none data-[active=true]:border-primary data-[active=true]:ring-primary/20 transition-all'
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                    <FieldError
                      errors={[resetForm.formState.touchedFields.otp ? resetForm.formState.errors.otp : undefined]}
                    />
                  </Field>
                )}
              />
            </div>

            <AuthInput
              {...resetForm.register('newPassword')}
              icon={Lock}
              type='password'
              placeholder={text.forgotPassword.newPassword}
              error={resetForm.formState.touchedFields.newPassword ? resetForm.formState.errors.newPassword : undefined}
            />

            <AuthInput
              {...resetForm.register('confirmPassword')}
              icon={Lock}
              type='password'
              placeholder={text.forgotPassword.confirmPassword}
              error={
                resetForm.formState.touchedFields.confirmPassword
                  ? resetForm.formState.errors.confirmPassword
                  : undefined
              }
            />

            <div className='pt-2'>
              <AuthButton
                isLoading={resetPasswordMutation.isPending}
                loadingText={text.form.submitting}
                disabled={!resetForm.formState.isValid}
              >
                {text.forgotPassword.confirm}
              </AuthButton>
            </div>
          </form>
        )}

        <div className='w-full px-5 mt-6'>
          {isRequestStep ? (
            <Link
              to={PATHS.AUTH.LOGIN}
              className='flex items-center text-[13px] text-muted-foreground hover:text-vibrant-blue transition-colors font-medium group'
            >
              <ChevronLeft className='mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5' />
              {text.forgotPassword.back}
            </Link>
          ) : (
            <button
              onClick={() => setStep('REQUEST')}
              className='flex items-center text-[13px] text-muted-foreground hover:text-vibrant-blue transition-colors font-medium group'
            >
              <ChevronLeft className='mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5' />
              {text.forgotPassword.back}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
