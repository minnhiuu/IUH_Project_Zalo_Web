import { Outlet, useLocation } from 'react-router'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLocale } from '@/lib/i18n'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'
import { PATHS } from '@/constants'
import { Button } from '@/components/ui/button'

export default function AuthLayout() {
  const { locale: current, changeLocale, languages } = useLocale()
  const { text } = useAuthText()
  const { theme, setTheme } = useTheme()
  const location = useLocation()

  const getSubtitle = () => {
    if (location.pathname === PATHS.AUTH.FORGOT_PASSWORD) {
      return text.forgotPassword.subtitle
    }
    return text.page.subtitle
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className='flex flex-col items-center min-h-screen w-full bg-brand-blue-light dark:bg-background font-sans transition-colors duration-300 relative auth-theme'>
      <div className='absolute top-4 right-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={toggleTheme}
          className='rounded-full hover:bg-white/20 dark:hover:bg-accent/50 transition-colors'
        >
          {theme === 'dark' ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5 text-primary' />}
        </Button>
      </div>

      <div className='w-full max-w-[480px] flex flex-col items-center pt-[8vh] flex-1'>
        <div className='mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-500'>
          <h1 className='text-primary text-[52px] font-bold tracking-tighter leading-none mb-3'>BondHub</h1>
          <p className='text-foreground font-normal text-[15px] leading-snug whitespace-pre-line opacity-80 transition-all duration-300 h-12 flex items-center justify-center text-center'>
            {getSubtitle()}
          </p>
        </div>

        <div className='w-full transition-all duration-300 ease-in-out'>
          <Outlet />
        </div>
      </div>

      <div className='py-8 text-center text-sm flex justify-center items-center gap-3 w-full'>
        {languages.map((lang, index) => (
          <div key={lang.code} className='flex items-center gap-3'>
            <span
              onClick={() => changeLocale(lang.code)}
              className={`cursor-pointer hover:underline text-vibrant-blue hover:text-vibrant-blue/90 text-[13px] transition-all ${
                current === lang.code ? 'font-bold' : 'opacity-70'
              }`}
            >
              {lang.label}
            </span>
            {index < languages.length - 1 && <span className='w-px h-3 bg-muted-foreground/30'></span>}
          </div>
        ))}
      </div>
    </div>
  )
}
