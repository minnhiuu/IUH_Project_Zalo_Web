export const AUTH_KEYS = {
  page: {
    subtitle: 'auth.page.subtitle'
  },

  form: {
    title: 'auth.form.title',
    email: 'auth.form.email',
    password: 'auth.form.password',
    submit: 'auth.form.submit',
    submitting: 'auth.form.submitting',
    forgot: 'auth.form.forgot',
    qr: 'auth.form.qr',
    noAccount: 'auth.form.noAccount',
    registerNow: 'auth.form.registerNow'
  },

  register: {
    title: 'auth.register.title',
    subtitle: 'auth.register.subtitle',
    fullname: 'auth.register.fullname',
    email: 'auth.register.email',
    phoneNumber: 'auth.register.phoneNumber',
    password: 'auth.register.password',
    confirmPassword: 'auth.register.confirmPassword',
    submit: 'auth.register.submit',
    submitting: 'auth.register.submitting',
    hasAccount: 'auth.register.hasAccount',
    loginNow: 'auth.register.loginNow'
  },

  verifyOtp: {
    title: 'auth.verifyOtp.title',
    subtitle: 'auth.verifyOtp.subtitle',
    instruction: 'auth.verifyOtp.instruction',
    otp: 'auth.verifyOtp.otp',
    submit: 'auth.verifyOtp.submit',
    submitting: 'auth.verifyOtp.submitting',
    resend: 'auth.verifyOtp.resend',
    success: 'auth.verifyOtp.success'
  },

  upload: {
    title: 'auth.upload.title',
    hint: 'auth.upload.hint',
    change: 'auth.upload.change',
    remove: 'auth.upload.remove',
    errorInvalid: 'auth.upload.errorInvalid',
    errorLimit: 'auth.upload.errorLimit'
  },

  toast: {
    loginSuccess: 'auth.toast.loginSuccess',
    qrComing: 'auth.toast.qrComing'
  },

  menu: {
    profile: 'auth.menu.profile',
    settings: 'auth.menu.settings',
    language: 'auth.menu.language',
    logout: 'auth.menu.logout'
  },

  logoutDialog: {
    title: 'auth.logoutDialog.title',
    confirmMessage: 'auth.logoutDialog.confirmMessage',
    no: 'auth.logoutDialog.no',
    yes: 'auth.logoutDialog.yes'
  },

  forgotPassword: {
    subtitle: 'auth.forgotPassword.subtitle',
    instruction: 'auth.forgotPassword.instruction',
    email: 'auth.forgotPassword.email',
    continue: 'auth.forgotPassword.continue',
    back: 'auth.forgotPassword.back',
    otp: 'auth.forgotPassword.otp',
    newPassword: 'auth.forgotPassword.newPassword',
    confirmPassword: 'auth.forgotPassword.confirmPassword',
    confirm: 'auth.forgotPassword.confirm',
    success: 'auth.forgotPassword.success',
    resetInstruction: 'auth.forgotPassword.resetInstruction'
  },

  qr: {
    title: 'auth.qr.title',
    loginWithPassword: 'auth.qr.loginWithPassword',
    expired: 'auth.qr.expired',
    refresh: 'auth.qr.refresh',
    confirmPhone: 'auth.qr.confirmPhone',
    scannedSuccess: 'auth.qr.scannedSuccess',
    instruction: 'auth.qr.instruction',
    generating: 'auth.qr.generating',
    generateError: 'auth.qr.generateError',
    retry: 'auth.qr.retry',
    loginFailed: 'auth.qr.loginFailed',
    rejected: 'auth.qr.rejected',
    expiredError: 'auth.qr.expiredError',
    onlyForLogin: 'auth.qr.onlyForLogin',
    appNameOnPC: 'auth.qr.appNameOnPC'
  },

  validation: {
    emailInvalid: 'auth.validation.emailInvalid',
    passwordRequired: 'auth.validation.passwordRequired',
    deviceIdRequired: 'auth.validation.deviceIdRequired',
    passwordMin: 'auth.validation.passwordMin',
    passwordComplex: 'auth.validation.passwordComplex',
    confirmPasswordRequired: 'auth.validation.confirmPasswordRequired',
    fullNameRequired: 'auth.validation.fullNameRequired',
    phoneInvalid: 'auth.validation.phoneInvalid',
    passwordMismatch: 'auth.validation.passwordMismatch',
    otpInvalid: 'auth.validation.otpInvalid',
    resetOtpMin: 'auth.validation.resetOtpMin',
    confirmPasswordReset: 'auth.validation.confirmPasswordReset'
  }
} as const
