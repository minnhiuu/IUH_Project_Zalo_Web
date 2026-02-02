import z from 'zod'
import { Gender } from '@/constants'
import i18n from '@/lib/i18n'

export type UserResponse = {
  id: string
  fullName: string
  dob: string
  bio: string
  gender: Gender
  accountId: string
  email: string
  phoneNumber: string
  role: string
  avatar?: string
  background?: string
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
  bio: z.string().max(150, i18n.t('user:user.validation.bioTooLong')).nullish()
})

export type UserUpdateRequest = z.infer<typeof userUpdateRequestSchema>
