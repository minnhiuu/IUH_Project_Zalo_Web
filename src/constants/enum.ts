export const Role = {
  Admin: 'ADMIN',
  User: 'USER'
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const ROLE_LABELS: Record<Role, string> = {
  [Role.Admin]: 'Quản trị viên',
  [Role.User]: 'Người dùng'
}

export const Gender = {
  Male: 'MALE',
  Female: 'FEMALE'
}

export type Gender = (typeof Gender)[keyof typeof Gender]

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.Male]: 'Nam',
  [Gender.Female]: 'Nữ'
}
