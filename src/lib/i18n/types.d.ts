import 'i18next'
import common from '@/locales/vi/common.json'
import auth from '@/features/auth/locales/vi.json'
import user from '@/features/user/locales/vi.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      auth: typeof auth
      user: typeof user
    }
  }
}
