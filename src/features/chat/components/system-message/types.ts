import type { TFunction } from 'i18next'
import type { ConversationMemberResponse } from '../../schemas/chat.schema'
import type { SystemMetadata } from '../../utils/system-message-label'

export interface ActionContext {
  metadata: SystemMetadata
  senderId: string | undefined
  currentUserId: string | undefined
  members: ConversationMemberResponse[]
  translate: TFunction<'chat'>
  actorNameLower: string
  actorNameCapital: string
  normalizedTargetIds: string[]
  normalizedCurrentUserId: string
}

export interface ActionResolveResult {
  i18nKey?: string
  values?: Record<string, string | number>
  clickableTargetIds?: string[]
  directLabel?: string
}
