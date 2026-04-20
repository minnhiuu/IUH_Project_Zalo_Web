import { format, formatDistanceToNow, parseISO, type Locale } from 'date-fns'
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
  if (!parsedDate) return '—'

  try {
    return format(parsedDate, dateFormat, { locale: getLocale(lang) })
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
      }).format(new Date(d.replace(' ', 'T')))
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

export const isSameDay = (d1: string | Date, d2: string | Date | null | undefined): boolean => {
  if (!d2) return false
  const date1 = new Date(d1)
  const date2 = new Date(d2)
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export const formatChatDivider = (date: string | Date, lang: string = 'vi'): string => {
  const d = new Date(date)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const checkDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (checkDate.getTime() === today.getTime()) {
    return lang === 'vi' ? 'Hôm nay' : 'Today'
  }
  if (checkDate.getTime() === yesterday.getTime()) {
    return lang === 'vi' ? 'Hôm qua' : 'Yesterday'
  }

  // Same year
  if (d.getFullYear() === now.getFullYear()) {
    return format(d, 'dd MMMM', { locale: getLocale(lang) })
  }

  return format(d, 'dd MMMM, yyyy', { locale: getLocale(lang) })
}

export const formatMessageTime = (date: string | Date | number | null | undefined, lang: string = 'vi'): string => {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : new Date(date)
  if (isNaN(d.getTime())) return ''

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return lang === 'vi' ? 'Vài giây' : 'Few sec'
  }

  // Dưới 1 giờ
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return lang === 'vi' ? `${diffInMinutes} phút` : `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''}`
  }

  // Dưới 1 ngày
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return lang === 'vi' ? `${diffInHours} giờ` : `${diffInHours} hour${diffInHours > 1 ? 's' : ''}`
  }

  // Dưới 7 ngày
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return lang === 'vi' ? `${diffInDays} ngày` : `${diffInDays} day${diffInDays > 1 ? 's' : ''}`
  }

  // Cùng năm
  if (d.getFullYear() === now.getFullYear()) {
    return format(d, 'dd/MM')
  }

  // Khác năm
  return format(d, 'dd/MM/yy')
}

/**
 * Format clock time for message bubble (HH:mm)
 */
export const formatMessageHour = (date: string | Date | number | null | undefined): string => {
  if (!date) return ''
  let d: Date
  if (typeof date === 'string') {
    // BE is now sending explicitly formatted strings; parseISO will handle the local conversion.
    const cleaned = date.endsWith('Z') ? date.slice(0, -1) : date
    d = parseISO(cleaned)
  } else {
    d = new Date(date)
  }

  if (isNaN(d.getTime())) return ''

  return format(d, 'HH:mm')
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
