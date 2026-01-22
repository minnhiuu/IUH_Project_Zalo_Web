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
