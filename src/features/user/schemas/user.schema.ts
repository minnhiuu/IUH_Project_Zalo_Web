import z from 'zod'
import { Gender } from '@/constants'

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
  fullName: z.string().trim().min(1, 'Tên hiển thị không được để trống'),
  dob: z.string().refine(
    (val) => {
      const date = new Date(val)
      return date <= new Date()
    },
    {
      message: 'Ngày sinh không được lớn hơn ngày hiện tại'
    }
  ),
  gender: z.enum([Gender.Male, Gender.Female] as [string, ...string[]]),
  bio: z.string().optional()
})

export type UserUpdateRequest = z.infer<typeof userUpdateRequestSchema>
