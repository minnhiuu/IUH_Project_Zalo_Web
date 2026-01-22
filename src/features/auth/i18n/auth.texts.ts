import type { TFunction } from 'i18next'
import { AUTH_KEYS } from './auth.keys'

export const createAuthTexts = (t: TFunction<'auth'>) => ({
  page: {
    subtitle: t(AUTH_KEYS.page.subtitle)
  },

  form: {
    title: t(AUTH_KEYS.form.title),
    phone: t(AUTH_KEYS.form.phone),
    password: t(AUTH_KEYS.form.password),
    submit: t(AUTH_KEYS.form.submit),
    submitting: t(AUTH_KEYS.form.submitting),
    forgot: t(AUTH_KEYS.form.forgot),
    qr: t(AUTH_KEYS.form.qr)
  },

  upload: {
    empty: {
      title: t(AUTH_KEYS.upload.title),
      hint: t(AUTH_KEYS.upload.hint)
    },
    action: {
      change: t(AUTH_KEYS.upload.change),
      remove: t(AUTH_KEYS.upload.remove)
    },
    error: {
      invalidType: t(AUTH_KEYS.upload.errorInvalid),
      limit: t(AUTH_KEYS.upload.errorLimit)
    }
  },

  toast: {
    loginSuccess: t(AUTH_KEYS.toast.loginSuccess),
    qrComing: t(AUTH_KEYS.toast.qrComing)
  },

  menu: {
    profile: t(AUTH_KEYS.menu.profile),
    settings: t(AUTH_KEYS.menu.settings),
    language: t(AUTH_KEYS.menu.language),
    logout: t(AUTH_KEYS.menu.logout)
  },

  logoutDialog: {
    title: t(AUTH_KEYS.logoutDialog.title),
    confirmMessage: t(AUTH_KEYS.logoutDialog.confirmMessage),
    no: t(AUTH_KEYS.logoutDialog.no),
    yes: t(AUTH_KEYS.logoutDialog.yes)
  }
})
