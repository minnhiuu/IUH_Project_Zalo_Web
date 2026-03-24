import authVi from '@/features/auth/locales/vi.json'
import authEn from '@/features/auth/locales/en.json'

import userVi from '@/features/user/locales/vi.json'
import userEn from '@/features/user/locales/en.json'

import chatVi from '@/features/chat/locales/vi.json'
import chatEn from '@/features/chat/locales/en.json'

import commonVi from '@/locales/vi/common.json'
import commonEn from '@/locales/en/common.json'

import searchVi from '@/features/search-user/locales/vi.json'
import searchEn from '@/features/search-user/locales/en.json'
import adminEsVi from '@/features/admin-elasticsearch/locales/vi.json'
import adminEsEn from '@/features/admin-elasticsearch/locales/en.json'
import adminVi from '@/locales/vi/admin.json'
import adminEn from '@/locales/en/admin.json'

import notificationVi from '@/features/notification/locales/vi.json'
import notificationEn from '@/features/notification/locales/en.json'

import friendVi from '@/features/friend/locales/vi.json'
import friendEn from '@/features/friend/locales/en.json'

export const resources = {
  vi: {
    common: commonVi,
    auth: authVi,
    user: userVi,
    chat: chatVi,
    search: searchVi,
    'admin-elasticsearch': adminEsVi,
    admin: adminVi,
    notification: notificationVi,
    friend: friendVi
  },
  en: {
    common: commonEn,
    auth: authEn,
    user: userEn,
    chat: chatEn,
    search: searchEn,
    'admin-elasticsearch': adminEsEn,
    admin: adminEn,
    notification: notificationEn,
    friend: friendEn
  }
} as const
