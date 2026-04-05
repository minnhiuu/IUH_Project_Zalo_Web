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

  if (action === 'ADD_MEMBERS') {
    const isSelfAdded = targetIds?.includes(String(currentUserId) || '')

    if (String(senderId) === String(currentUserId)) {
      return translate('chat.system.add_members.group_created') as string
    }

    const actorName = members.find((m) => String(m.userId) === String(senderId))?.fullName || 'User'
    
    if (isSelfAdded) {
      return translate('chat.system.add_members.joined_group') as string
    }

    const firstTargetName = members.find((m) => String(m.userId) === String(targetIds?.[0]))?.fullName || 'User'
    if (targetIds && targetIds.length > 2) {
      const preview = translate('chat.system.add_members.many_other_count', {
        targets: firstTargetName,
        count: targetIds.length - 1,
        actor: actorName
      }) as string
      return preview.replace(/<[^>]*>/g, '')
    } else if (targetIds && targetIds.length === 2) {
       const preview = translate('chat.system.add_members.many_other', {
        targets: targetIds.map((id) => members.find((m) => String(m.userId) === String(id))?.fullName || 'User').join(', '),
        actor: actorName
      }) as string
      return preview.replace(/<[^>]*>/g, '')
    } else if (targetIds && targetIds.length === 1) {
       const preview = translate('chat.system.add_members.single_other', {
        target: firstTargetName,
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
