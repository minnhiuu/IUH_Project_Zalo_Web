import { LoginForm } from '@/features/auth'

export default function LoginPage() {
  return (
    <div className='flex flex-col items-center w-full max-w-[400px] animate-in fade-in duration-700'>
      <div className='mb-8 text-center'>
        <h1 className='text-primary text-[42px] font-bold tracking-tight leading-none mb-3'>BondHub</h1>
        <p className='text-foreground/80 font-medium text-[1.1rem] leading-snug'>
          Đăng nhập tài khoản BondHub
          <br />
          để kết nối với ứng dụng BondHub Web
        </p>
      </div>

      <LoginForm />

      <div className='mt-8 text-center text-sm'>
        <span className='font-bold cursor-pointer hover:underline text-primary'>Tiếng Việt</span>
        <span className='mx-3 text-muted-foreground/30'>&nbsp;</span>
        <span className='cursor-pointer hover:underline text-muted-foreground'>English</span>
      </div>
    </div>
  )
}
