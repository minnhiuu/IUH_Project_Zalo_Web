import { createContext, useContext } from 'react'
import { LANGUAGES } from './constants'
import type { AppLocale } from './constants'

interface LocaleContextValue {
  locale: AppLocale
  changeLocale: (locale: AppLocale) => void
  languages: typeof LANGUAGES
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export const useLocale = () => {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return ctx
}
