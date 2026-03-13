import authVi from '@/features/auth/locales/vi.json'
import authEn from '@/features/auth/locales/en.json'

import userVi from '@/features/user/locales/vi.json'
import userEn from '@/features/user/locales/en.json'

import commonVi from '@/locales/vi/common.json'
import commonEn from '@/locales/en/common.json'

import searchVi from '@/features/search-user/locales/vi.json'
import searchEn from '@/features/search-user/locales/en.json'

import friendVi from '@/features/friend/locales/vi.json'
import friendEn from '@/features/friend/locales/en.json'

export const resources = {
  vi: {
    common: commonVi,
    auth: authVi,
    user: userVi,
    search: searchVi,
    friend: friendVi
  },
  en: {
    common: commonEn,
    auth: authEn,
    user: userEn,
    search: searchEn,
    friend: friendEn
  }
} as const
