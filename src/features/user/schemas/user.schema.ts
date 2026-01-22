import { Gender } from '@/constants'

export type UserResponse = {
  id: string
  fullname: string
  dob: string
  bio: string
  gender: Gender
  accountId: string
  email: string
  phoneNumber: string
  role: string
}
