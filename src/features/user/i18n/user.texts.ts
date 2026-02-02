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
    female: t(USER_KEYS.profile.female),
    editTitle: t(USER_KEYS.profile.editTitle),
    fullNameLabel: t(USER_KEYS.profile.fullNameLabel),
    fullNamePlaceholder: t(USER_KEYS.profile.fullNamePlaceholder),
    fullNameNote: t(USER_KEYS.profile.fullNameNote),
    day: t(USER_KEYS.profile.day),
    month: t(USER_KEYS.profile.month),
    year: t(USER_KEYS.profile.year),
    cancel: t(USER_KEYS.profile.cancel),
    updating: t(USER_KEYS.profile.updating),
    bioLabel: t(USER_KEYS.profile.bioLabel),
    bioPlaceholder: t(USER_KEYS.profile.bioPlaceholder)
  },
  validation: {
    fullNameRequired: t(USER_KEYS.validation.fullNameRequired),
    dobInvalid: t(USER_KEYS.validation.dobInvalid),
    genderRequired: t(USER_KEYS.validation.genderRequired),
    bioTooLong: t(USER_KEYS.validation.bioTooLong)
  }
})
