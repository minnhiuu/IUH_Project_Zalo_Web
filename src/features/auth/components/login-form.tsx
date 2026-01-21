import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Smartphone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { type LoginRequest, loginRequestSchema } from '@/features/auth/schemas/auth.schema'
import { cn } from '@/lib/utils'
import { useLoginMutation } from '@/features/auth/mutation/auth.mutations'
import { DeviceType, PATHS } from '@/constants'
import { useAuth } from '@/features/auth'
import { getDeviceId } from '@/utils/device'
import { handleErrorApi } from '@/utils/error-handler'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'

export default function LoginForm() {
  const { loginSuccess } = useAuth()
  const deviceId = getDeviceId()
  const navigate = useNavigate()

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
      toast.success('Đăng nhập thành công')
      navigate(PATHS.HOME)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <div className='w-full bg-card shadow-[0_8px_28px_rgba(0,0,0,0.1)] rounded-[8px] overflow-hidden border border-border'>
      <div className='border-b border-muted text-center py-4 bg-white'>
        <p className='text-[15px] font-bold text-foreground'>Đăng nhập với mật khẩu</p>
      </div>

      <div className='p-8 pt-10 bg-white'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <Controller
            name='phoneNumber'
            control={form.control}
            render={({ field }) => (
              <Field>
                <div className='group flex items-center border-b border-muted pb-2 focus-within:border-primary transition-colors'>
                  <Smartphone className='mr-3 h-5 w-5 text-foreground/40' />
                  <Input
                    {...field}
                    placeholder='Số điện thoại'
                    autoComplete='off'
                    spellCheck={false}
                    className='h-auto w-full border-none bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0 placeholder:text-foreground/30 font-normal outline-none selection:bg-primary selection:text-white rounded-none'
                  />
                </div>
              </Field>
            )}
          />

          <Controller
            name='password'
            control={form.control}
            render={({ field }) => (
              <Field>
                <div className='group flex items-center border-b border-muted pb-2 focus-within:border-primary transition-colors'>
                  <Lock className='mr-3 h-5 w-5 text-foreground/40' />
                  <Input
                    {...field}
                    type='password'
                    placeholder='Mật khẩu'
                    autoComplete='new-password'
                    spellCheck={false}
                    className='h-auto w-full border-none bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0 placeholder:text-foreground/30 font-normal outline-none selection:bg-primary selection:text-white rounded-none'
                  />
                </div>
              </Field>
            )}
          />

          <div className='pt-2'>
            <Button
              type='submit'
              disabled={!isValid}
              className={cn(
                'w-full font-medium h-11 rounded-[4px] text-base transition-all shadow-none border-none',
                isValid
                  ? 'bg-primary text-white hover:brightness-105 cursor-pointer opacity-100'
                  : 'bg-accent text-white/90 cursor-not-allowed opacity-100'
              )}
            >
              Đăng nhập với mật khẩu
            </Button>
          </div>
        </form>

        <div className='mt-4 text-center'>
          <p className='text-[15px] text-foreground hover:text-foreground cursor-pointer transition-colors'>
            Quên mật khẩu
          </p>
        </div>

        <div className='mt-12 text-center'>
          <a className='text-[16px] text-primary hover:underline font-bold cursor-pointer'>Đăng nhập qua mã QR</a>
        </div>
      </div>
    </div>
  )
}
