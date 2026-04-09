import { format, formatDistanceToNow, type Locale } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

const locales: Record<string, Locale> = {
  vi: vi,
  en: enUS
}

export const getLocale = (lang: string = 'vi') => locales[lang] || vi

export const formatTimeAgo = (
  date: string | Date | number | null | undefined,
  lang: string = 'vi',
  short: boolean = false
) => {
  if (!date) return '—'

  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)

  try {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return lang === 'vi' ? '1 phút' : '1 minute'
    }

    const timeAgo = formatDistanceToNow(d, {
      addSuffix: !short,
      locale: getLocale(lang)
    })

    if (short) {
      return timeAgo.replace('khoảng ', '').replace('hơn ', '').replace('dưới ', '').replace('gần ', '').trim()
    }
    return timeAgo
  } catch (error) {
    console.error('Time ago formatting error:', error)
    return String(date)
  }
}

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
export const formatLastSeen = (
  date: string | Date | number | null | undefined,
  statusTexts?: {
    justNow: string
    minutesAgo: (count: number) => string
    hoursAgo: (count: number) => string
    daysAgo: (count: number) => string
    onDate: (date: string) => string
  }
): string => {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)

  if (!statusTexts) {
    // Fallback if translations not provided
    return format(d, 'dd/MM/yyyy')
  }

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return statusTexts.justNow

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return statusTexts.minutesAgo(diffInMinutes)

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return statusTexts.hoursAgo(diffInHours)

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return statusTexts.daysAgo(diffInDays)

  return statusTexts.onDate(format(d, 'dd/MM/yyyy'))
}
