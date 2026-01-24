import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router'
import axios from 'axios'
import { toast } from 'sonner'
import { useEffect } from 'react'

import { type RegisterVerifyRequest, registerVerifyRequestSchema } from '@/features/auth/schemas/auth.schema'
import { useVerifyRegistration } from '@/features/auth/queries/use-mutations'
import { PATHS, DeviceType } from '@/constants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getDeviceId } from '@/utils/device'
import { handleErrorApi, getErrorMessage } from '@/utils/error-handler'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'
import { AuthInput } from './common/auth-input'
import { AuthButton } from './common/auth-button'

export default function VerifyOtpForm() {
  const { loginSuccess } = useAuth()
  const deviceId = getDeviceId()
  const navigate = useNavigate()
  const location = useLocation()
  const { text } = useAuthText()

  const email = (location.state as { email?: string })?.email

  useEffect(() => {
    if (!email) {
      toast.error('Vui lòng đăng ký trước khi xác thực OTP')
      navigate(PATHS.AUTH.REGISTER)
    }
  }, [email, navigate])

  const form = useForm<RegisterVerifyRequest>({
    resolver: zodResolver(registerVerifyRequestSchema),
    mode: 'onChange',
    defaultValues: {
      email: email || '',
      otp: '',
      deviceId,
      deviceType: DeviceType.Web
    }
  })

  const verifyRegistrationMutation = useVerifyRegistration()
  const { isValid, errors, touchedFields } = form.formState

  const onSubmit = async (data: RegisterVerifyRequest) => {
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
          form.setError('otp', {
            type: 'server',
            message
          })
          return
        }
      }
      handleErrorApi({ error, setError: form.setError })
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className='w-full max-w-[500px] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden border border-border/40 px-6 transition-all'>
      <div className='border-b border-gray-100 text-center py-4 bg-white'>
        <p className='text-md font-bold text-foreground tracking-wide'>{text.verifyOtp.title}</p>
      </div>

      <div className='p-12 bg-white'>
        <div className='mb-6 text-center'>
          <p className='text-sm text-muted-foreground'>
            {text.verifyOtp.instruction}
            <br />
            <span className='font-semibold text-foreground'>{email}</span>
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 px-5'>
          <AuthInput
            {...form.register('otp')}
            icon={KeyRound}
            placeholder={text.verifyOtp.otp}
            maxLength={6}
            error={touchedFields.otp ? errors.otp : undefined}
          />

          <div className='pt-2'>
            <AuthButton
              isLoading={verifyRegistrationMutation.isPending}
              loadingText={text.verifyOtp.submitting}
              disabled={!isValid}
            >
              {text.verifyOtp.submit}
            </AuthButton>
          </div>
        </form>

        <div className='mt-6 text-center'>
          <button
            type='button'
            className='text-sm text-vibrant-blue hover:underline font-semibold'
            onClick={() => toast.info('Tính năng đang phát triển')}
          >
            {text.verifyOtp.resend}
          </button>
        </div>
      </div>
    </div>
  )
}
