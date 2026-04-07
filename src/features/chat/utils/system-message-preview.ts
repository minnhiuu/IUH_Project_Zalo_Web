import type { TFunction } from 'i18next'
import type { ConversationMemberResponse } from '../schemas/chat.schema'
import { getSystemMessageLabel, type SystemMetadata } from './system-message'

export function getSystemMessagePreview(
  metadataRaw: unknown,
  senderId: string | undefined, // Added
  currentUserId: string | undefined,
  members: ConversationMemberResponse[],
  translate: TFunction<'chat'>
): string {
  const metadata = metadataRaw as SystemMetadata | null | undefined
  if (!metadata) return ''

  const { action, targetIds, payload } = metadata

  if (action === 'CREATE_GROUP') {
    const isSelfInTargets = targetIds?.includes(String(currentUserId) || '')

    if (String(senderId) === String(currentUserId)) {
      return translate('chat.system.add_members.group_created') as string
    }

    if (isSelfInTargets) {
      return translate('chat.system.add_members.joined_group') as string
    }

    return ''
  }

  if (action === 'ADD_MEMBERS') {
    const normalizedTargetIds = (targetIds || []).map((id) => String(id))
    const normalizedCurrentUserId = String(currentUserId || '')
    const isSelfAdded = normalizedTargetIds.includes(normalizedCurrentUserId)

    const actorName = members.find((m) => String(m.userId) === String(senderId))?.fullName || 'User'

    if (isSelfAdded) {
      return translate('chat.system.add_members.joined_group') as string
    }

    const targetNames = normalizedTargetIds.map(
      (id) => members.find((m) => String(m.userId) === String(id))?.fullName || 'User'
    )

    if (normalizedTargetIds.length > 4) {
      const preview = translate('chat.system.add_members.many_other_count', {
        targets: targetNames.slice(0, 4).join(', '),
        count: normalizedTargetIds.length - 4,
        actor: actorName
      }) as string
      return preview.replace(/<[^>]*>/g, '')
    } else if (normalizedTargetIds.length >= 2) {
      const preview = translate('chat.system.add_members.many_other', {
        targets: targetNames.join(', '),
        actor: actorName
      }) as string
      return preview.replace(/<[^>]*>/g, '')
    } else if (normalizedTargetIds.length === 1) {
      const preview = translate('chat.system.add_members.single_other', {
        target: targetNames[0] || 'User',
        actor: actorName
      }) as string
      return preview.replace(/<[^>]*>/g, '')
    }
  }

  if (action === 'DISBAND_GROUP') {
    return translate('chat.system.add_members.disband_group') as string
  }

  if (action === 'UPDATE_NAME') {
    return translate('chat.system.add_members.update_name_simple', { newName: payload?.newName }) as string
  }

  if (action === 'UPDATE_AVATAR') {
    return translate('chat.system.add_members.update_avatar_simple') as string
  }

  // Fallback to standard labels for other cases
  const label = getSystemMessageLabel(metadataRaw, senderId, undefined, currentUserId, members, translate, false)
  return typeof label === 'string' ? label : ''
}
