import z from 'zod'
import { Gender } from '@/constants'
import i18n from '@/lib/i18n'

export type UserAccountInfo = {
  id?: string
  phoneNumber?: string
  email?: string
  role?: string
}

export type UserResponse = {
  id: string
  fullName: string
  dob?: string | null
  bio?: string | null
  gender?: string | null
  accountId?: string | null
  /** Present on /users/me (UserProfileResponse) — flat fields */
  email?: string | null
  phoneNumber?: string | null
  role?: string | null
  /** Present on /users/{id} (UserResponse from backend) — nested */
  accountInfo?: UserAccountInfo | null
  avatar?: string | null
  background?: string | null
  backgroundY?: number | null
  active?: boolean | null
}

export type UserImageResponse = {
  url: string
  x?: number
  y?: number
}

export const userUpdateRequestSchema = z.object({
  fullName: z.string().trim().min(1, i18n.t('user:user.validation.fullNameRequired')),
  dob: z.string().refine(
    (val) => {
      const date = new Date(val)
      return date <= new Date()
    },
    {
      message: i18n.t('user:user.validation.dobInvalid')
    }
  ),
  gender: z.enum([Gender.Male, Gender.Female] as [string, ...string[]], {
    error: i18n.t('user:user.validation.genderRequired')
  }),
  phoneNumber: z
    .string()
    .trim()
    .min(1, i18n.t('user:user.validation.phoneRequired'))
    .regex(/^\d{10,11}$/, i18n.t('user:user.validation.phoneInvalid')),
  bio: z.string().max(150, i18n.t('user:user.validation.bioTooLong')).nullish()
})

export type UserUpdateRequest = z.infer<typeof userUpdateRequestSchema>
