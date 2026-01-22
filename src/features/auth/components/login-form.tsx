import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import axios from 'axios'
import { toast } from 'sonner'

import { type LoginRequest, loginRequestSchema } from '@/features/auth/schemas/auth.schema'
import { useLoginMutation } from '@/features/auth/queries/use-mutations'
import { DeviceType, PATHS } from '@/constants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getDeviceId } from '@/utils/device'
import { handleErrorApi, getErrorMessage } from '@/utils/error-handler'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'
import { AuthInput } from './common/auth-input'
import { AuthButton } from './common/auth-button'

export default function LoginForm() {
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

  const loginMutation = useLoginMutation()
  const { isValid, errors, touchedFields } = form.formState

  const onSubmit = async (data: LoginRequest) => {
    if (loginMutation.isPending) return
    try {
      const result = await loginMutation.mutateAsync(data)
      const { accessToken } = result.data.data!
      await loginSuccess(accessToken)
      navigate(PATHS.HOME)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const code = error.response?.data?.code
        if (code === 1006 || code === 2006) {
          form.setError('password', {
            type: 'server',
            message: getErrorMessage(code)
          })
          return
        }
      }
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <div className='w-full max-w-[500px] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden border border-border/40 px-6 transition-all'>
      <div className='border-b border-gray-100 text-center py-4 bg-white'>
        <p className='text-md font-bold text-foreground tracking-wide'>{text.form.title}</p>
      </div>

      <div className='p-12 bg-white'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 px-5'>
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

        <div className='mt-10 text-center mb-6'>
          <p
            className='text-[15px] text-vibrant-blue hover:text-vibrant-blue/90 hover:underline cursor-pointer font-bold'
            onClick={() => toast.info(text.toast.qrComing)}
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
  )
}
