import type { TFunction } from 'i18next'
import { USER_KEYS } from './user.keys'

export const createUserTexts = (t: TFunction<'user'>) => ({
  menu: {
    profile: t(USER_KEYS.menu.profile),
    settings: t(USER_KEYS.menu.settings),
    language: t(USER_KEYS.menu.language),
    logout: t(USER_KEYS.menu.logout)
  },
  profile: {
    title: t(USER_KEYS.profile.title),
    personalInfo: t(USER_KEYS.profile.personalInfo),
    gender: t(USER_KEYS.profile.gender),
    dob: t(USER_KEYS.profile.dob),
    phone: t(USER_KEYS.profile.phone),
    update: t(USER_KEYS.profile.update),
    privacyNote: t(USER_KEYS.profile.privacyNote),
    male: t(USER_KEYS.profile.male),
    female: t(USER_KEYS.profile.female)
  }
})
