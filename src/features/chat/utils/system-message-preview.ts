import type { TFunction } from 'i18next'
import type { ConversationMemberResponse } from '../schemas/chat.schema'
import { getSystemMessageLabel, type SystemMetadata } from './system-message'

export function getSystemMessagePreview(
  metadataRaw: unknown,
  currentUserId: string | undefined,
  members: ConversationMemberResponse[],
  translate: TFunction<'chat'>
): string {
  const metadata = metadataRaw as SystemMetadata | null | undefined
  if (!metadata) return ''

  const { action, actorId, targetIds, payload } = metadata

  if (action === 'ADD_MEMBERS') {
    const isSelfAdded = targetIds?.includes(currentUserId || '')

    if (actorId === currentUserId && (!targetIds || targetIds.length === 0)) {
      return translate('chat.system.add_members.group_created') as string
    }

    if (isSelfAdded) {
      return translate('chat.system.add_members.joined_group') as string
    }
  }

  if (action === 'UPDATE_NAME') {
    return translate('chat.system.add_members.update_name_simple', { newName: payload?.newName }) as string
  }

  if (action === 'UPDATE_AVATAR') {
    return translate('chat.system.add_members.update_avatar_simple') as string
  }

  // Fallback to standard labels for other cases
  const label = getSystemMessageLabel(metadataRaw, currentUserId, members, translate, false)
  return typeof label === 'string' ? label : ''
}
