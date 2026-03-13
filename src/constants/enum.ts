export const Role = {
  Admin: 'ADMIN',
  User: 'USER'
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const ROLE_LABELS: Record<Role, string> = {
  [Role.Admin]: 'Quản trị viên',
  [Role.User]: 'Người dùng'
}

export const DeviceType = {
  Web: 'WEB',
  Mobile: 'MOBILE'
} as const

export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType]

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  [DeviceType.Web]: 'Web',
  [DeviceType.Mobile]: 'Mobile'
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

export const QrSessionStatus = {
  Pending: 'PENDING',
  Scanned: 'SCANNED',
  Confirmed: 'CONFIRMED',
  Rejected: 'REJECTED'
} as const

export type QrSessionStatus = (typeof QrSessionStatus)[keyof typeof QrSessionStatus]

export const ElasticsearchClusterStatus = {
  Green: 'GREEN',
  Yellow: 'YELLOW',
  Red: 'RED',
  Unreachable: 'UNREACHABLE',
  Unknown: 'UNKNOWN'
} as const

export type ElasticsearchClusterStatus = (typeof ElasticsearchClusterStatus)[keyof typeof ElasticsearchClusterStatus]

export const DataSyncStatus = {
  InSync: 'IN_SYNC',
  EsAhead: 'ES_AHEAD',
  DbAhead: 'DB_AHEAD'
} as const

export type DataSyncStatus = (typeof DataSyncStatus)[keyof typeof DataSyncStatus]

export const ReindexTaskStatus = {
  Running: 'RUNNING',
  Completed: 'COMPLETED',
  Failed: 'FAILED'
} as const

export type ReindexTaskStatus = (typeof ReindexTaskStatus)[keyof typeof ReindexTaskStatus]

export const IndexStatus = {
  Active: 'ACTIVE',
  Standby: 'STANDBY'
} as const

export type IndexStatus = (typeof IndexStatus)[keyof typeof IndexStatus]

export const SearchType = {
  User: 'USER',
  Group: 'GROUP',
  Keyword: 'KEYWORD'
} as const

export type SearchType = (typeof SearchType)[keyof typeof SearchType]
