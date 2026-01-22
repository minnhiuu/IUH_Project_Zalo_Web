import { LoginForm } from '@/features/auth'
import { LANGUAGES, setLocale, getCurrentLocale } from '@/lib/language'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'

export default function LoginPage() {
  const { text } = useAuthText()
  const current = getCurrentLocale()

  return (
    <div className='flex flex-col items-center justify-center min-h-screen max-w-6xl w-full bg-secondary py-10 animate-in fade-in zoom-in-95 duration-500'>
      <div className='mb-8 text-center'>
        <h1 className='text-primary text-[52px] font-bold tracking-tighter leading-none mb-3'>BondHub</h1>
        <p className='text-foreground font-normal text-[15px] leading-snug whitespace-pre-line'>{text.page.subtitle}</p>
      </div>

      <LoginForm />

      <div className='mt-8 text-center text-sm flex justify-center items-center gap-3'>
        {LANGUAGES.map((lang, index) => (
          <div key={lang.code} className='flex items-center gap-3'>
            <span
              onClick={() => setLocale(lang.code)}
              className={`cursor-pointer hover:underline text-primary hover:text-primary/90 text-[13px] ${current === lang.code ? 'font-bold' : ''}`}
            >
              {lang.label}
            </span>
            {index < LANGUAGES.length - 1 && <span className='w-px h-3 bg-muted-foreground/40'></span>}
          </div>
        ))}
      </div>
    </div>
  )
}
