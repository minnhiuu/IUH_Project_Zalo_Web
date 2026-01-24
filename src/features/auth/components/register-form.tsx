import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, User, Phone, KeyRound, ChevronLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import axios from 'axios'
import { toast } from 'sonner'

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Field, FieldError } from '@/components/ui/field'

import {
  type RegisterRequest,
  registerRequestSchema,
  type RegisterVerifyRequest,
  registerVerifyRequestSchema
} from '@/features/auth/schemas/auth.schema'
import { useInitiateRegistration, useVerifyRegistration } from '@/features/auth/queries/use-mutations'
import { PATHS, DeviceType } from '@/constants'
import { handleErrorApi, getErrorMessage } from '@/utils/error-handler'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'
import { AuthInput } from './common/auth-input'
import { AuthButton } from './common/auth-button'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getDeviceId } from '@/utils/device'

type Step = 'REGISTER' | 'VERIFY'

export default function RegisterForm() {
  const { loginSuccess } = useAuth()
  const deviceId = getDeviceId()
  const navigate = useNavigate()
  const { text } = useAuthText()
  const [step, setStep] = useState<Step>('REGISTER')
  const [email, setEmail] = useState('')

  const registerForm = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phoneNumber: ''
    }
  })

  const verifyForm = useForm<RegisterVerifyRequest>({
    resolver: zodResolver(registerVerifyRequestSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      otp: '',
      deviceId,
      deviceType: DeviceType.Web
    }
  })

  const initiateRegistrationMutation = useInitiateRegistration()
  const verifyRegistrationMutation = useVerifyRegistration()

  const onHandleRegister = async (data: RegisterRequest) => {
    if (initiateRegistrationMutation.isPending) return

    try {
      const result = await initiateRegistrationMutation.mutateAsync(data)
      toast.success(result.data.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.')
      setEmail(data.email)
      verifyForm.setValue('email', data.email)
      setStep('VERIFY')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const code = error.response?.data?.code
        if (code) {
          const message = getErrorMessage(code)
          if (code === 2001) {
            registerForm.setError('email', {
              type: 'server',
              message
            })
            return
          }
        }
      }
      handleErrorApi({ error, setError: registerForm.setError })
    }
  }

  const onHandleVerify = async (data: RegisterVerifyRequest) => {
    if (verifyRegistrationMutation.isPending) return

    try {
      const result = await verifyRegistrationMutation.mutateAsync(data)
      const { accessToken } = result.data.data!
      toast.success(text.verifyOtp.success)
      await loginSuccess(accessToken)
      navigate(PATHS.HOME)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const code = error.response?.data?.code
        if (code) {
          const message = getErrorMessage(code)
          verifyForm.setError('otp', {
            type: 'server',
            message
          })
          return
        }
      }
      handleErrorApi({ error, setError: verifyForm.setError })
    }
  }

  const isRegisterStep = step === 'REGISTER'

  return (
    <div className='w-full max-w-[500px] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden border border-border/40 px-6 transition-all'>
      <div className='border-b border-gray-100 text-center py-4 bg-white'>
        <p className='text-md font-bold text-foreground tracking-wide'>
          {isRegisterStep ? text.register.title : text.verifyOtp.title || 'Xác thực tài khoản'}
        </p>
      </div>

      <div className='p-12 bg-white'>
        {isRegisterStep ? (
          <form onSubmit={registerForm.handleSubmit(onHandleRegister)} className='space-y-6 px-5'>
            <AuthInput
              {...registerForm.register('fullName')}
              icon={User}
              placeholder={text.register.fullname}
              error={
                registerForm.formState.touchedFields.fullName ? registerForm.formState.errors.fullName : undefined
              }
            />

            <AuthInput
              {...registerForm.register('email')}
              icon={Mail}
              placeholder={text.register.email}
              error={registerForm.formState.touchedFields.email ? registerForm.formState.errors.email : undefined}
            />

            <AuthInput
              {...registerForm.register('phoneNumber')}
              icon={Phone}
              placeholder={text.register.phoneNumber}
              error={
                registerForm.formState.touchedFields.phoneNumber
                  ? registerForm.formState.errors.phoneNumber
                  : undefined
              }
            />

            <AuthInput
              {...registerForm.register('password')}
              icon={Lock}
              type='password'
              placeholder={text.register.password}
              autoComplete='new-password'
              error={registerForm.formState.touchedFields.password ? registerForm.formState.errors.password : undefined}
            />

            <AuthInput
              {...registerForm.register('confirmPassword')}
              icon={Lock}
              type='password'
              placeholder={text.register.confirmPassword}
              autoComplete='new-password'
              error={
                registerForm.formState.touchedFields.confirmPassword
                  ? registerForm.formState.errors.confirmPassword
                  : undefined
              }
            />

            <div className='pt-2'>
              <AuthButton
                isLoading={initiateRegistrationMutation.isPending}
                loadingText={text.register.submitting}
                disabled={!registerForm.formState.isValid}
              >
                {text.register.submit}
              </AuthButton>
            </div>
          </form>
        ) : (
          <>
            <p className='text-[15px] font-normal text-foreground mb-8 text-center whitespace-pre-line px-5'>
              {text.verifyOtp.instruction}
              {'\n'}
              <span className='font-semibold'>{email}</span>
            </p>

            <form onSubmit={verifyForm.handleSubmit(onHandleVerify)} className='space-y-6 px-5'>
              <div className='w-full flex flex-col items-center space-y-4 mb-4'>
                <div className='flex items-center justify-center gap-2 text-muted-foreground/80'>
                  <KeyRound className='h-4 w-4' strokeWidth={2} />
                  <span className='text-[14px] font-medium'>{text.verifyOtp.otp}</span>
                </div>
                <Controller
                  name='otp'
                  control={verifyForm.control}
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
                        errors={[
                          verifyForm.formState.touchedFields.otp ? verifyForm.formState.errors.otp : undefined
                        ]}
                      />
                    </Field>
                  )}
                />
              </div>

              <div className='pt-2'>
                <AuthButton
                  isLoading={verifyRegistrationMutation.isPending}
                  loadingText={text.verifyOtp.submitting}
                  disabled={!verifyForm.formState.isValid}
                >
                  {text.verifyOtp.submit}
                </AuthButton>
              </div>
            </form>

            <div className='w-full px-5 mt-6'>
              <button
                type='button'
                className='text-[13px] text-vibrant-blue hover:underline font-medium transition-colors'
                onClick={() => toast.info('Tính năng đang phát triển')}
              >
                {text.verifyOtp.resend}
              </button>
            </div>
          </>
        )}

        <div className='mt-8 text-center border-t border-gray-100 pt-6 mb-4 px-5'>
          {isRegisterStep ? (
            <p className='text-sm text-muted-foreground'>
              {text.register.hasAccount}{' '}
              <Link to={PATHS.AUTH.LOGIN} className='text-vibrant-blue hover:underline font-bold'>
                {text.register.loginNow}
              </Link>
            </p>
          ) : (
            <button
              onClick={() => setStep('REGISTER')}
              className='flex items-center text-[13px] text-muted-foreground hover:text-vibrant-blue transition-colors font-medium group'
            >
              <ChevronLeft className='mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5' />
              Quay lại đăng ký
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
