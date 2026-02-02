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

  register: {
    title: t(AUTH_KEYS.register.title),
    subtitle: t(AUTH_KEYS.register.subtitle),
    fullname: t(AUTH_KEYS.register.fullname),
    email: t(AUTH_KEYS.register.email),
    phoneNumber: t(AUTH_KEYS.register.phoneNumber),
    password: t(AUTH_KEYS.register.password),
    confirmPassword: t(AUTH_KEYS.register.confirmPassword),
    submit: t(AUTH_KEYS.register.submit),
    submitting: t(AUTH_KEYS.register.submitting),
    hasAccount: t(AUTH_KEYS.register.hasAccount),
    loginNow: t(AUTH_KEYS.register.loginNow)
  },

  verifyOtp: {
    title: t(AUTH_KEYS.verifyOtp.title),
    subtitle: t(AUTH_KEYS.verifyOtp.subtitle),
    instruction: t(AUTH_KEYS.verifyOtp.instruction),
    otp: t(AUTH_KEYS.verifyOtp.otp),
    submit: t(AUTH_KEYS.verifyOtp.submit),
    submitting: t(AUTH_KEYS.verifyOtp.submitting),
    resend: t(AUTH_KEYS.verifyOtp.resend),
    success: t(AUTH_KEYS.verifyOtp.success)
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
  },

  qr: {
    title: t(AUTH_KEYS.qr.title),
    loginWithPassword: t(AUTH_KEYS.qr.loginWithPassword),
    expired: t(AUTH_KEYS.qr.expired),
    refresh: t(AUTH_KEYS.qr.refresh),
    confirmPhone: t(AUTH_KEYS.qr.confirmPhone),
    scannedSuccess: t(AUTH_KEYS.qr.scannedSuccess),
    instruction: t(AUTH_KEYS.qr.instruction),
    generating: t(AUTH_KEYS.qr.generating),
    generateError: t(AUTH_KEYS.qr.generateError),
    retry: t(AUTH_KEYS.qr.retry),
    loginFailed: t(AUTH_KEYS.qr.loginFailed),
    rejected: t(AUTH_KEYS.qr.rejected),
    expiredError: t(AUTH_KEYS.qr.expiredError),
    onlyForLogin: t(AUTH_KEYS.qr.onlyForLogin),
    appNameOnPC: t(AUTH_KEYS.qr.appNameOnPC)
  },

  validation: {
    emailInvalid: t(AUTH_KEYS.validation.emailInvalid),
    passwordRequired: t(AUTH_KEYS.validation.passwordRequired),
    deviceIdRequired: t(AUTH_KEYS.validation.deviceIdRequired),
    passwordMin: t(AUTH_KEYS.validation.passwordMin),
    passwordComplex: t(AUTH_KEYS.validation.passwordComplex),
    confirmPasswordRequired: t(AUTH_KEYS.validation.confirmPasswordRequired),
    fullNameRequired: t(AUTH_KEYS.validation.fullNameRequired),
    phoneInvalid: t(AUTH_KEYS.validation.phoneInvalid),
    passwordMismatch: t(AUTH_KEYS.validation.passwordMismatch),
    otpInvalid: t(AUTH_KEYS.validation.otpInvalid),
    resetOtpMin: t(AUTH_KEYS.validation.resetOtpMin),
    confirmPasswordReset: t(AUTH_KEYS.validation.confirmPasswordReset)
  }
})
