import { format, formatDistanceToNow, parseISO, type Locale } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

const locales: Record<string, Locale> = {
  vi: vi,
  en: enUS
}

const resolveLocale = (lang: string): Locale => {
  const normalizedLang = lang.toLowerCase().split('-')[0]
  return locales[normalizedLang] || enUS
}

const toDate = (date: string | Date | number | null | undefined): Date | null => {
  if (!date) return null

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof date === 'number') {
    const parsedFromNumber = new Date(date)
    return Number.isNaN(parsedFromNumber.getTime()) ? null : parsedFromNumber
  }

  const parsedIso = parseISO(date)
  if (!Number.isNaN(parsedIso.getTime())) {
    return parsedIso
  }

  const parsedFallback = new Date(date)
  return Number.isNaN(parsedFallback.getTime()) ? null : parsedFallback
}

export const formatDate = (
  date: string | Date | number | null | undefined,
  lang: string = 'vi',
  dateFormat: string = 'dd MMMM, yyyy'
) => {
  const parsedDate = toDate(date)
  if (!parsedDate) return ''

  const localeObj = resolveLocale(lang)

  try {
    return format(parsedDate, dateFormat, { locale: localeObj })
  } catch (error) {
    console.error('Date formatting error:', error)
    return ''
  }
}

export const formatRelativeTime = (
  date: string | Date | number | null | undefined,
  lang: string = 'vi',
  addSuffix: boolean = true
) => {
  const parsedDate = toDate(date)
  if (!parsedDate) return ''

  const localeObj = resolveLocale(lang)

  try {
    return formatDistanceToNow(parsedDate, { addSuffix, locale: localeObj })
  } catch (error) {
    console.error('Relative date formatting error:', error)
    return ''
  }
}
