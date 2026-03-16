import { useEffect, useState } from 'react'
import i18n from './index'
import { storage, STORAGE_KEYS } from '@/utils/local-storage'

import { LANGUAGES } from './constants'
import type { AppLocale } from './constants'
import { LocaleContext } from './use-locale'

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<AppLocale>(() => {
    return (i18n.language as AppLocale) || 'vi'
  })

  const changeLocale = (next: AppLocale) => {
    if (next === locale) return
    i18n.changeLanguage(next)
    storage.set(STORAGE_KEYS.LOCALE, next)
    setLocale(next)
  }

  useEffect(() => {
    i18n.changeLanguage(locale)
  }, [locale])

  return (
    <LocaleContext.Provider
      value={{
        locale,
        changeLocale,
        languages: LANGUAGES
      }}
    >
      {children}
    </LocaleContext.Provider>
  )
}
