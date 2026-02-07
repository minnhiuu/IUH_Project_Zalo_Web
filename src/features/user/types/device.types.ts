import type { DeviceType } from '@/constants/enum'

export interface DeviceResponse {
  id: string
  deviceId: string
  sessionId: string
  deviceName: string
  browser: string
  os: string
  deviceType: DeviceType
  ipAddress: string
  lastActiveTime?: string
  accountId: string
  createdAt: string
  lastModifiedAt: string
  createdBy?: string
  lastModifiedBy?: string
  issuedAt?: number
  expiresAt?: number
  isActive?: boolean
  isCurrentDevice?: boolean
}
