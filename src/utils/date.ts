import { format, type Locale } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

const locales: Record<string, Locale> = {
  vi: vi,
  en: enUS
}

export const getLocale = (lang: string = 'vi') => locales[lang] || vi

export const formatDate = (
  date: string | Date | number | null | undefined,
  lang: string = 'vi',
  dateFormat: string = 'dd MMMM, yyyy'
) => {
  if (!date) return '—'

  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)

  try {
    return format(d, dateFormat, { locale: getLocale(lang) })
  } catch (error) {
    console.error('Date formatting error:', error)
    return String(date)
  }
}

export const formatFullDateTime = (date: string | Date | number | null | undefined, lang: string = 'vi') =>
  formatDate(date, lang, 'HH:mm:ss dd/MM/yyyy')

export const formatCompactDateTime = (date: string | Date | number | null | undefined, lang: string = 'vi') =>
  formatDate(date, lang, 'dd/MM/yyyy HH:mm')

export const getCurrentTimestamp = () => Date.now()

const VI_VN = 'vi-VN'

export const formatDateTimeShort = (d?: string): string =>
  d
    ? new Intl.DateTimeFormat(VI_VN, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(d))
    : '—'

export const formatDateTimeLong = (d?: string): string =>
  d
    ? new Intl.DateTimeFormat(VI_VN, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(d))
    : '—'
