import authVi from '@/features/auth/locales/vi.json'
import authEn from '@/features/auth/locales/en.json'

import userVi from '@/features/user/locales/vi.json'
import userEn from '@/features/user/locales/en.json'

import commonVi from '@/locales/vi/common.json'
import commonEn from '@/locales/en/common.json'

import errorVi from '@/locales/vi/error.json'
import errorEn from '@/locales/en/error.json'

export const resources = {
  vi: {
    common: commonVi,
    auth: authVi,
    user: userVi,
    error: errorVi
  },
  en: {
    common: commonEn,
    auth: authEn,
    user: userEn,
    error: errorEn
  }
} as const
