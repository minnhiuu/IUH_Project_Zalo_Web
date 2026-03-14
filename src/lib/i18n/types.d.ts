import 'i18next'
import common from '@/locales/vi/common.json'
import auth from '@/features/auth/locales/vi.json'
import user from '@/features/user/locales/vi.json'
import search from '@/features/search-user/locales/vi.json'
import adminEs from '@/features/admin-elasticsearch/locales/vi.json'
import admin from '@/locales/vi/admin.json'
import chat from '@/features/chat/locales/vi.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      auth: typeof auth
      user: typeof user
      chat: typeof chat
      admin: typeof user
      search: typeof search
      'admin-elasticsearch': typeof adminEs
      admin: typeof admin
    }
  }
}
