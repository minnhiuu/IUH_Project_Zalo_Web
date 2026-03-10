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
