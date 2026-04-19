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

export const Status = {
  Online: 'ONLINE',
  Offline: 'OFFLINE'
} as const

export type Status = (typeof Status)[keyof typeof Status]

export const MessageType = {
  Chat: 'CHAT',
  Image: 'IMAGE',
  Video: 'VIDEO',
  File: 'FILE',
  Link: 'LINK',
  System: 'SYSTEM',
  Call: 'CALL',
  SystemFriendshipCard: 'SYSTEM_FRIENDSHIP_CARD',
  SystemFriendshipBadge: 'SYSTEM_FRIENDSHIP_BADGE'
} as const

export type MessageType = (typeof MessageType)[keyof typeof MessageType]

export const MessageStatus = {
  NORMAL: 'NORMAL',
  REVOKED: 'REVOKED',
  DELETED_BY_ADMIN: 'DELETED_BY_ADMIN'
} as const

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus]

export const Platform = {
  Android: 'ANDROID',
  iOS: 'IOS',
  Web: 'WEB'
} as const

export const NotificationType = {
  DOB: 'DOB',
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIEND_ACCEPT: 'FRIEND_ACCEPT',
  MESSAGE_DIRECT: 'MESSAGE_DIRECT',
  CALL: 'CALL',
  POST_LIKE: 'POST_LIKE',
  POST_COMMENT: 'POST_COMMENT',
  COMMENT_LIKE: 'COMMENT_LIKE',
  COMMENT_REPLY: 'COMMENT_REPLY',
  POST_TAG: 'POST_TAG',
  POST_MENTION: 'POST_MENTION',
  COMMENT_MENTION: 'COMMENT_MENTION',
  SYSTEM: 'SYSTEM',
  DLQ_ALERT: 'DLQ_ALERT',
  CONTENT_REMOVED: 'CONTENT_REMOVED',
  CONTENT_HIDDEN: 'CONTENT_HIDDEN',
  USER_WARNED: 'USER_WARNED'
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

// ── AI Processing Status ────────────────────────────────────────────────────────
// Các trạng thái pipeline của AI Service, khớp với enum AiProcessingStatus.java (BE)
export const AiProcessingStatus = {
  AnalyzingIntent: 'ANALYZING_INTENT',
  RetrievingVector: 'RETRIEVING_VECTOR',
  GradingData: 'GRADING_DATA',
  WebSearching: 'WEB_SEARCHING',
  GeneratingAnswer: 'GENERATING_ANSWER'
} as const

export type AiProcessingStatus = (typeof AiProcessingStatus)[keyof typeof AiProcessingStatus]

export const GroupMemberRole = {
  Owner: 'OWNER',
  Admin: 'ADMIN',
  Member: 'MEMBER'
} as const

export type GroupMemberRole = (typeof GroupMemberRole)[keyof typeof GroupMemberRole]

export const SystemActionType = {
  CreateGroup: 'CREATE_GROUP',
  AddMembers: 'ADD_MEMBERS',
  RemoveMember: 'REMOVE_MEMBER',
  LeaveGroup: 'LEAVE_GROUP',
  UpdateName: 'UPDATE_NAME',
  UpdateAvatar: 'UPDATE_AVATAR',
  DisbandGroup: 'DISBAND_GROUP',
  PromoteAdmin: 'PROMOTE_ADMIN',
  DemoteAdmin: 'DEMOTE_ADMIN',
  TransferOwner: 'TRANSFER_OWNER',
  UpdateSettings: 'UPDATE_SETTINGS',
  JoinByLink: 'JOIN_BY_LINK',
  GenerateJoinLink: 'GENERATE_JOIN_LINK',
  RefreshJoinLink: 'REFRESH_JOIN_LINK',
  PinMessage: 'PIN_MESSAGE',
  UnpinMessage: 'UNPIN_MESSAGE',
  JoinRequestCreated: 'JOIN_REQUEST_CREATED',
  JoinRequestApproved: 'JOIN_REQUEST_APPROVED',
  JoinRequestRejected: 'JOIN_REQUEST_REJECTED',
  BlockMember: 'BLOCK_MEMBER',
  BlockedFromJoining: 'BLOCKED_FROM_JOINING',
  SelfBlockedFromJoining: 'SELF_BLOCKED_FROM_JOINING',
  AddMembersFailed: 'ADD_MEMBERS_FAILED'
} as const

export type SystemActionType = (typeof SystemActionType)[keyof typeof SystemActionType]
