import authVi from '@/features/auth/locales/vi.json'
import authEn from '@/features/auth/locales/en.json'

import userVi from '@/features/user/locales/vi.json'
import userEn from '@/features/user/locales/en.json'

import commonVi from '@/locales/vi/common.json'
import commonEn from '@/locales/en/common.json'

export const resources = {
  vi: {
    common: commonVi,
    auth: authVi,
    user: userVi
  },
  en: {
    common: commonEn,
    auth: authEn,
    user: userEn
  }
} as const
