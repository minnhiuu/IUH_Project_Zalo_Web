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
