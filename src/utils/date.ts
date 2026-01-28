import { format, type Locale } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

const locales: Record<string, Locale> = {
  vi: vi,
  en: enUS
}

export const formatDate = (
  date: string | Date | number | null | undefined,
  lang: string = 'vi',
  dateFormat: string = 'dd MMMM, yyyy'
) => {
  if (!date) return ''

  const localeObj = locales[lang] || enUS

  try {
    return format(new Date(date), dateFormat, { locale: localeObj })
  } catch (error) {
    console.error('Date formatting error:', error)
    return ''
  }
}
