import { useState, useEffect } from 'react'
import i18n from '@/lib/i18n'
import { storage } from '@/utils/local-storage'

export type AppLocale = 'vi' | 'en'

export const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', flag: '/images/vi.png' },
  { code: 'en', label: 'English', flag: '/images/en.png' }
] as const

export const getCurrentLocale = (): AppLocale => (i18n.language as AppLocale) || 'vi'

export const setLocale = (locale: AppLocale) => {
  i18n.changeLanguage(locale)
  storage.set('locale', locale)
}

export const initLocale = () => {
  const saved = storage.get<AppLocale>('locale')
  if (saved) i18n.changeLanguage(saved)
}

export const useAppLanguage = () => {
  const [language, setLanguage] = useState<AppLocale>(getCurrentLocale())

  useEffect(() => {
    const handleLanguageChanged = () => {
      setLanguage(getCurrentLocale())
    }
    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [])

  return { language, setLocale }
}
