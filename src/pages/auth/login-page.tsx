import { LoginForm } from '@/features/auth'

export default function LoginPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen max-w-6xl w-full bg-secondary py-10 animate-in fade-in zoom-in-95 duration-500'>
      <div className='mb-8 text-center'>
        <h1 className='text-primary text-[52px] font-bold tracking-tighter leading-none mb-3'>BondHub</h1>
        <p className='text-foreground font-normal text-[15px] leading-snug'>
          Đăng nhập tài khoản BondHub
          <br />
          để kết nối với ứng dụng BondHub Web
        </p>
      </div>

      <LoginForm />

      <div className='mt-8 text-center text-sm flex justify-center items-center gap-3'>
        <span className='cursor-pointer hover:underline text-primary hover:text-primary/90 text-[13px] font-bold'>
          Tiếng Việt
        </span>
        <span className='w-px h-3 bg-muted-foreground/40'></span>
        <span className='cursor-pointer hover:underline text-primary hover:text-primary/90 text-[13px]'>English</span>
      </div>
    </div>
  )
}
