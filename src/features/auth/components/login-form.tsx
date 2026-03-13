import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import axios from 'axios'

import { type LoginRequest, loginRequestSchema } from '@/features/auth/schemas/auth.schema'
import { useLoginMutation } from '@/features/auth/queries/use-mutations'
import { DeviceType, PATHS, Role } from '@/constants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getDeviceId } from '@/utils/device'
import { handleErrorApi, getErrorMessage } from '@/utils/error-handler'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'
import { AuthInput } from './common/auth-input'
import { AuthButton } from './common/auth-button'
import { FullScreenLoading } from '@/components/common/full-screen-loading'
import { useState } from 'react'

export default function LoginForm({ onSwitchToQR }: { onSwitchToQR: () => void }) {
  const { loginSuccess } = useAuth()
  const deviceId = getDeviceId()
  const navigate = useNavigate()
  const { text } = useAuthText()

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      deviceId,
      deviceType: DeviceType.Web
    }
  })

  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const loginMutation = useLoginMutation()
  const { isValid, errors, touchedFields } = form.formState

  const onSubmit = async (data: LoginRequest) => {
    setIsLoggingIn(true)
    try {
      const result = await loginMutation.mutateAsync(data)
      const { accessToken, refreshTokenExpirationMs } = result.data.data!
      const user = await loginSuccess(accessToken, refreshTokenExpirationMs)
      if (user.role === Role.Admin) {
        navigate(PATHS.ADMIN.DASHBOARD)
      } else {
        navigate(PATHS.HOME)
      }
    } catch (error) {
      setIsLoggingIn(false)
      if (axios.isAxiosError(error)) {
        const code = error.response?.data?.code
        if (code === 1006 || code === 2006) {
          form.setError('password', {
            type: 'server',
            message: getErrorMessage(error)
          })
          return
        }
      }
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <>
      {isLoggingIn && <FullScreenLoading message={text.form.loggingIn} />}
      <div className='w-full max-w-[450px] bg-white dark:bg-card shadow-[0_8px_28px_rgba(0,0,0,0.06)] dark:shadow-none rounded-xl overflow-hidden border-none transition-all animate-in fade-in zoom-in-95 duration-300'>
        <div className='text-center py-4 bg-white dark:bg-card'>
          <p className='text-[16px] font-semibold text-foreground tracking-tight'>{text.form.title}</p>
        </div>

        <div className='h-px bg-gray-100 dark:bg-border/50 mx-auto w-full' />

        <div className='p-10 bg-white dark:bg-card'>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <AuthInput
              {...form.register('email')}
              icon={Mail}
              placeholder={text.form.email}
              error={touchedFields.email ? errors.email : undefined}
            />

            <AuthInput
              {...form.register('password')}
              icon={Lock}
              type='password'
              placeholder={text.form.password}
              autoComplete='current-password'
              error={touchedFields.password ? errors.password : undefined}
            />

            <div className='pt-2'>
              <AuthButton isLoading={loginMutation.isPending} loadingText={text.form.submitting} disabled={!isValid}>
                {text.form.submit}
              </AuthButton>
            </div>
          </form>

          <div className='mt-5 text-center'>
            <Link
              to={PATHS.AUTH.FORGOT_PASSWORD}
              className='text-[13px] text-muted-foreground hover:text-vibrant-blue hover:underline cursor-pointer transition-colors font-normal'
            >
              {text.form.forgot}
            </Link>
          </div>

          <div className='mt-10 text-center mb-6 px-10'>
            <p
              className='text-[15px] text-vibrant-blue hover:text-vibrant-blue/90 hover:underline cursor-pointer font-bold transition-all hover:scale-[1.02]'
              onClick={onSwitchToQR}
            >
              {text.form.qr}
            </p>
          </div>

          <div className='mt-8 text-center border-t border-gray-100 pt-6 mb-4'>
            <p className='text-sm text-muted-foreground'>
              {text.form.noAccount}{' '}
              <Link to={PATHS.AUTH.REGISTER} className='text-vibrant-blue hover:underline font-bold'>
                {text.form.registerNow}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
