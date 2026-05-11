import z from 'zod'
import { SearchType } from '@/constants/enum'
import i18n from '@/lib/i18n'
import type { FriendStatus } from '@/features/friend/schemas/friend.schema'
import type { UserSummaryResponse } from '@/shared/user/user-summary'

export const recentSearchRequestSchema = z.object({
  id: z.string().min(1, i18n.t('globalSearch:validation.idRequired')),
  name: z.string().min(1, i18n.t('globalSearch:validation.nameRequired')),
  avatar: z.string().optional(),
  type: z.enum([SearchType.User, SearchType.Group, SearchType.Keyword], {
    message: i18n.t('globalSearch:validation.typeInvalid')
  })
})

export type RecentSearchRequest = z.infer<typeof recentSearchRequestSchema>

export type RecentSearchResponse = {
  id: string
  name: string
  avatar?: string
  type: SearchType
  timestamp: number
}

export type RecentHistoryResponse = {
  items: RecentSearchResponse[]
  queries: RecentSearchResponse[]
}

export type UserSearchResponse = UserSummaryResponse & {
  friendshipId?: string | null
  friendshipStatus?: FriendStatus | null
  requestedBy?: string | null
  relationshipLabel?: string | null
  mutualFriendsCount?: number | null
  sharedGroupsCount?: number | null
  inContact?: boolean | null
  contactScore?: number | null
}

export const SearchEventType = {
  UserResultClick: 'USER_RESULT_CLICK'
} as const

export type SearchEventType = (typeof SearchEventType)[keyof typeof SearchEventType]

export type SearchEventRequest = {
  keyword: string
  targetUserId: string
  rank?: number
  eventType: SearchEventType
}
