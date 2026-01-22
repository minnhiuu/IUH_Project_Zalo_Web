import type { TFunction } from 'i18next'
import { AUTH_KEYS } from './auth.keys'

export const createAuthTexts = (t: TFunction<'auth'>) => ({
  page: {
    subtitle: t(AUTH_KEYS.page.subtitle)
  },

  form: {
    title: t(AUTH_KEYS.form.title),
    email: t(AUTH_KEYS.form.email),
    password: t(AUTH_KEYS.form.password),
    submit: t(AUTH_KEYS.form.submit),
    submitting: t(AUTH_KEYS.form.submitting),
    forgot: t(AUTH_KEYS.form.forgot),
    qr: t(AUTH_KEYS.form.qr),
    noAccount: t(AUTH_KEYS.form.noAccount),
    registerNow: t(AUTH_KEYS.form.registerNow)
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
  },

  forgotPassword: {
    subtitle: t(AUTH_KEYS.forgotPassword.subtitle),
    instruction: t(AUTH_KEYS.forgotPassword.instruction),
    email: t(AUTH_KEYS.forgotPassword.email),
    continue: t(AUTH_KEYS.forgotPassword.continue),
    back: t(AUTH_KEYS.forgotPassword.back),
    otp: t(AUTH_KEYS.forgotPassword.otp),
    newPassword: t(AUTH_KEYS.forgotPassword.newPassword),
    confirmPassword: t(AUTH_KEYS.forgotPassword.confirmPassword),
    confirm: t(AUTH_KEYS.forgotPassword.confirm),
    success: t(AUTH_KEYS.forgotPassword.success),
    resetInstruction: t(AUTH_KEYS.forgotPassword.resetInstruction)
  }
})
