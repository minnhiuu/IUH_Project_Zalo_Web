import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, User, Phone } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import axios from 'axios'
import { toast } from 'sonner'

import { type RegisterRequest, registerRequestSchema } from '@/features/auth/schemas/auth.schema'
import { useInitiateRegistration } from '@/features/auth/queries/use-mutations'
import { PATHS } from '@/constants'
import { handleErrorApi, getErrorMessage } from '@/utils/error-handler'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'
import { AuthInput } from './common/auth-input'
import { AuthButton } from './common/auth-button'

export default function RegisterForm() {
  const navigate = useNavigate()
  const { text } = useAuthText()

  const form = useForm<RegisterRequest>({
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

  const initiateRegistrationMutation = useInitiateRegistration()
  const { isValid, errors, touchedFields } = form.formState

  const onSubmit = async (data: RegisterRequest) => {
    if (initiateRegistrationMutation.isPending) return

    try {
      const result = await initiateRegistrationMutation.mutateAsync(data)
      toast.success(result.data.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.')
      // Chuyển sang trang verify OTP với email
      navigate(PATHS.AUTH.VERIFY_OTP, { state: { email: data.email } })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const code = error.response?.data?.code
        if (code) {
          const message = getErrorMessage(code)
          if (code === 2001) {
            form.setError('email', {
              type: 'server',
              message
            })
            return
          }
        }
      }
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <div className='w-full max-w-[500px] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden border border-border/40 px-6 transition-all'>
      <div className='border-b border-gray-100 text-center py-4 bg-white'>
        <p className='text-md font-bold text-foreground tracking-wide'>{text.register.title}</p>
      </div>

      <div className='p-12 bg-white'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 px-5'>
          <AuthInput
            {...form.register('fullName')}
            icon={User}
            placeholder={text.register.fullname}
            error={touchedFields.fullName ? errors.fullName : undefined}
          />

          <AuthInput
            {...form.register('email')}
            icon={Mail}
            placeholder={text.register.email}
            error={touchedFields.email ? errors.email : undefined}
          />

          <AuthInput
            {...form.register('phoneNumber')}
            icon={Phone}
            placeholder={text.register.phoneNumber}
            error={touchedFields.phoneNumber ? errors.phoneNumber : undefined}
          />

          <AuthInput
            {...form.register('password')}
            icon={Lock}
            type='password'
            placeholder={text.register.password}
            autoComplete='new-password'
            error={touchedFields.password ? errors.password : undefined}
          />

          <AuthInput
            {...form.register('confirmPassword')}
            icon={Lock}
            type='password'
            placeholder={text.register.confirmPassword}
            autoComplete='new-password'
            error={touchedFields.confirmPassword ? errors.confirmPassword : undefined}
          />

          <div className='pt-2'>
            <AuthButton
              isLoading={initiateRegistrationMutation.isPending}
              loadingText={text.register.submitting}
              disabled={!isValid}
            >
              {text.register.submit}
            </AuthButton>
          </div>
        </form>

        <div className='mt-8 text-center border-t border-gray-100 pt-6 mb-4'>
          <p className='text-sm text-muted-foreground'>
            {text.register.hasAccount}{' '}
            <Link to={PATHS.AUTH.LOGIN} className='text-vibrant-blue hover:underline font-bold'>
              {text.register.loginNow}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
