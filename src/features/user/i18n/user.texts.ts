import type { TFunction } from 'i18next'
import { USER_KEYS } from './user.keys'

export const createUserTexts = (t: TFunction<'user'>) => ({
  menu: {
    profile: t(USER_KEYS.menu.profile),
    settings: t(USER_KEYS.menu.settings),
    language: t(USER_KEYS.menu.language),
    appearance: t(USER_KEYS.menu.appearance),
    themeLight: t(USER_KEYS.menu.themeLight),
    themeDark: t(USER_KEYS.menu.themeDark),
    themeSystem: t(USER_KEYS.menu.themeSystem),
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
    confirm: t(USER_KEYS.profile.confirm),
    edit: t(USER_KEYS.profile.edit),
    updating: t(USER_KEYS.profile.updating),
    bioLabel: t(USER_KEYS.profile.bioLabel),
    bioPlaceholder: t(USER_KEYS.profile.bioPlaceholder),
    bio: t(USER_KEYS.profile.bio),
    noBio: t(USER_KEYS.profile.noBio),
    selectImageError: t(USER_KEYS.profile.selectImageError),
    updateAvatarSuccess: t(USER_KEYS.profile.updateAvatarSuccess),
    updateBackgroundSuccess: t(USER_KEYS.profile.updateBackgroundSuccess),
    updateAvatarTitle: t(USER_KEYS.profile.updateAvatarTitle),
    updateBackgroundTitle: t(USER_KEYS.profile.updateBackgroundTitle),
    dragToMove: t(USER_KEYS.profile.dragToMove),
    editCover: t(USER_KEYS.profile.editCover),
    addPhoto: t(USER_KEYS.profile.addPhoto),
    uploadPhoto: t(USER_KEYS.profile.uploadPhoto),
    repositionPhoto: t(USER_KEYS.profile.repositionPhoto)
  },
  validation: {
    fullNameRequired: t(USER_KEYS.validation.fullNameRequired),
    dobInvalid: t(USER_KEYS.validation.dobInvalid),
    genderRequired: t(USER_KEYS.validation.genderRequired),
    bioTooLong: t(USER_KEYS.validation.bioTooLong)
  }
})
