import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Smartphone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError } from '@/components/ui/field'
import { type LoginRequest, loginRequestSchema } from '@/features/auth/schemas/auth.schema'
import { cn } from '@/lib/utils'
import { useLoginMutation } from '@/features/auth/mutation/auth.mutations'
import { DeviceType, PATHS } from '@/constants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getDeviceId } from '@/utils/device'
import axios from 'axios'
import { handleErrorApi, getErrorMessage } from '@/utils/error-handler'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'

export default function LoginForm() {
  const { loginSuccess } = useAuth()
  const deviceId = getDeviceId()
  const navigate = useNavigate()
  const { text } = useAuthText()

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    mode: 'onChange',
    defaultValues: {
      phoneNumber: '',
      password: '',
      deviceId,
      deviceType: DeviceType.Web
    }
  })
  const loginMutation = useLoginMutation()
  const { isValid } = form.formState

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
    <div className='w-full max-w-lg bg-white shadow-[0_8px_28px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden border border-border/40 px-5'>
      <div className='border-b border-gray-100 text-center py-4 bg-white'>
        <p className='text-md font-bold text-foreground tracking-wide'>{text.form.title}</p>
      </div>

      <div className='p-12 bg-white'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 px-5'>
          <Controller
            name='phoneNumber'
            control={form.control}
            render={({ field }) => (
              <Field>
                <div className='group flex items-center border-b border-gray-200 pb-2 focus-within:border-primary transition-all duration-200'>
                  <Smartphone className='mr-3 h-5 w-5' strokeWidth={1.5} />
                  <Input
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      field.onChange(value)
                    }}
                    placeholder={text.form.phone}
                    autoComplete='tel'
                    spellCheck={false}
                    className='h-auto w-full border-none bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60 font-normal outline-none text-foreground selection:bg-primary/20 rounded-none border-0 ring-0'
                  />
                </div>
                <FieldError
                  errors={[
                    form.formState.errors.phoneNumber?.type === 'server' ? form.formState.errors.phoneNumber : undefined
                  ]}
                />
              </Field>
            )}
          />

          <Controller
            name='password'
            control={form.control}
            render={({ field }) => (
              <Field>
                <div className='group flex items-center border-b border-gray-200 pb-2 focus-within:border-primary transition-all duration-200'>
                  <Lock className='mr-3 h-5 w-5' strokeWidth={1.5} />
                  <Input
                    {...field}
                    type='password'
                    placeholder={text.form.password}
                    autoComplete='current-password'
                    spellCheck={false}
                    className='h-auto w-full border-none bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60 font-normal outline-none text-foreground selection:bg-primary/20 rounded-none border-0 ring-0'
                  />
                </div>
                <FieldError
                  errors={[
                    form.formState.errors.password?.type === 'server' ? form.formState.errors.password : undefined
                  ]}
                />
              </Field>
            )}
          />

          <div className='pt-2'>
            <Button
              type='submit'
              variant='vibrant'
              disabled={!isValid || loginMutation.isPending}
              className={cn(
                'w-full font-bold text-[16px] transition-all shadow-none border-none rounded-[4px] h-[48px]',
                !isValid && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loginMutation.isPending ? text.form.submitting : text.form.submit}
            </Button>
          </div>
        </form>
        <div className='mt-5 text-center'>
          <p className='text-[13px] text-muted-foreground hover:text-primary hover:underline cursor-pointer transition-colors font-normal'>
            {text.form.forgot}
          </p>
        </div>
        <div className='mt-10 text-center mb-6'>
          <p
            className='text-[15px] text-primary hover:text-primary/90 hover:underline cursor-pointer font-bold'
            onClick={() => toast.info(text.toast.qrComing)}
          >
            {text.form.qr}
          </p>
        </div>
      </div>
    </div>
  )
}
