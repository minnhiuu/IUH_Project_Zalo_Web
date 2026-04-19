import z from 'zod'
import { Gender } from '@/constants'

/** Nested account info from auth-service */
export type AccountInfo = {
  id: string
  phoneNumber?: string
  email?: string
  role: string
  isVerified: boolean
}

/** User profile fields */
export type UserInfo = {
  id: string
  fullName: string
  dob?: string
  bio?: string
  gender?: Gender
  accountInfo?: AccountInfo
  avatar?: string
  background?: string
  backgroundY?: number
}

/** Audit fields included in list response */
export type AuditInfo = {
  createdAt: string
  lastModifiedAt?: string
  createdBy?: string
  lastModifiedBy?: string
  lastLoginAt?: string
  lastLogin?: string
  active: boolean
}

/** Item returned by GET /admin/users (paginated list) */
export type AdminUserListItem = {
  user: UserInfo
  audit: AuditInfo
}

/** Full detail returned by GET /admin/users/{id} */
export type AdminUserDetailResponse = {
  id: string
  fullName: string
  dob?: string
  bio?: string
  gender?: Gender
  avatar?: string
  background?: string
  backgroundY?: number
  accountId: string
  email?: string
  phoneNumber?: string
  role: string
  isVerified: boolean
  createdAt: string
  lastModifiedAt?: string
  createdBy?: string
  lastModifiedBy?: string
  lastLoginAt?: string
  lastLogin?: string
  totalActivityLogs: number

  // Ban status (source of truth for FE)
  active: boolean

  // Ban info (null if not banned)
  banReason?: string
}

export const banUserRequestSchema = z.object({
  reason: z.string().min(1, 'Lý do cấm không được để trống')
})

export type BanUserRequest = z.infer<typeof banUserRequestSchema>

export type UserFilterParams = {
  name?: string
  phone?: string
  email?: string
  status?: 'ACTIVE' | 'BANNED'
  page?: number
  size?: number
}
