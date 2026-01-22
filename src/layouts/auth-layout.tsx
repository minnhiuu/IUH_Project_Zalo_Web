import { Outlet, useLocation } from 'react-router'
import { useLocale } from '@/lib/i18n'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'
import { PATHS } from '@/constants'

export default function AuthLayout() {
  const { locale: current, changeLocale, languages } = useLocale()
  const { text } = useAuthText()
  const location = useLocation()

  const getSubtitle = () => {
    if (location.pathname === PATHS.AUTH.FORGOT_PASSWORD) {
      return text.forgotPassword.subtitle
    }
    return text.page.subtitle
  }

  return (
    <div className='flex flex-col items-center min-h-screen w-full bg-secondary font-sans'>
      <div className='w-full max-w-lg flex flex-col items-center pt-[8vh] flex-1'>
        <div className='mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-500'>
          <h1 className='text-primary text-[52px] font-bold tracking-tighter leading-none mb-3'>BondHub</h1>
          <p className='text-foreground font-normal text-[15px] leading-snug whitespace-pre-line opacity-80 transition-all duration-300 h-12 flex items-center justify-center'>
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
