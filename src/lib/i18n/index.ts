import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from './resources'
import { storage } from '@/utils/local-storage'

const savedLocale = storage.get<string>('locale') || 'vi'

i18n.use(initReactI18next).init({
  resources,
  lng: savedLocale,
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
export * from './locale.context'
export * from './constants'
export * from './use-locale'
