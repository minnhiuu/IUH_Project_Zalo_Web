import type { TFunction } from 'i18next'
import type { ConversationMemberResponse } from '../schemas/chat.schema'
import { getSystemMessageLabel, type SystemMetadata } from './system-message'

export interface SystemMessagePreviewDisplay {
  text: string
  showPromoteTargetIcon: boolean
}

export function getSystemMessagePreviewDisplay(
  metadataRaw: unknown,
  senderId: string | undefined,
  senderName: string | undefined,
  currentUserId: string | undefined,
  members: ConversationMemberResponse[],
  translate: TFunction<'chat'>
): SystemMessagePreviewDisplay {
  const metadata = metadataRaw as SystemMetadata | null | undefined
  if (!metadata) {
    return { text: '', showPromoteTargetIcon: false }
  }

  const showPromoteTargetIcon =
    metadata.action === 'PROMOTE_ADMIN' && (metadata.targetIds || []).map(String).includes(String(currentUserId || ''))

  const showTransferOwnerIcon =
    metadata.action === 'TRANSFER_OWNER' && (metadata.targetIds || []).map(String).includes(String(currentUserId || ''))

  return {
    text: getSystemMessagePreview(metadataRaw, senderId, senderName, currentUserId, members, translate),
    showPromoteTargetIcon: showPromoteTargetIcon || showTransferOwnerIcon
  }
}

export function getSystemMessagePreview(
  metadataRaw: unknown,
  senderId: string | undefined, // Added
  senderName: string | undefined,
  currentUserId: string | undefined,
  members: ConversationMemberResponse[],
  translate: TFunction<'chat'>
): string {
  const metadata = metadataRaw as SystemMetadata | null | undefined
  if (!metadata) return ''
  const fallbackUserLabel = String(translate('chat.user'))
  const memberNameById = new Map(members.map((m) => [String(m.userId), m.fullName]))

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
    const payloadTargetNames = Array.isArray(payload?.targetNames) ? payload.targetNames.map(String) : []

    const actorName = memberNameById.get(String(senderId)) || senderName || fallbackUserLabel

    if (isSelfAdded) {
      return translate('chat.system.add_members.joined_group') as string
    }

    const targetNames = normalizedTargetIds.map(
      (id, index) => memberNameById.get(String(id)) || payloadTargetNames[index] || fallbackUserLabel
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
        target: targetNames[0] || fallbackUserLabel,
        actor: actorName
      }) as string
      return preview.replace(/<[^>]*>/g, '')
    }
  }

  if (action === 'DISBAND_GROUP') {
    return translate('chat.system.add_members.disband_group') as string
  }

  if (action === 'REMOVE_MEMBER') {
    const normalizedTargetIds = (targetIds || []).map((id) => String(id))
    const normalizedCurrentUserId = String(currentUserId || '')
    const targetId = normalizedTargetIds[0]
    const payloadTargetName = typeof payload?.targetName === 'string' ? String(payload.targetName) : undefined
    const targetName =
      targetId === normalizedCurrentUserId
        ? String(translate('chat.you'))
        : (memberNameById.get(String(targetId)) ?? payloadTargetName ?? fallbackUserLabel)
    const actorName = memberNameById.get(String(senderId)) || senderName || fallbackUserLabel

    if (targetId && targetId === normalizedCurrentUserId) {
      return translate('chat.system.remove_member.self_removed') as string
    }

    if (String(senderId) === String(currentUserId)) {
      const preview = translate('chat.system.remove_member.by_you', { target: targetName }) as string
      return preview.replace(/<[^>]*>/g, '')
    }

    const preview = translate('chat.system.remove_member.by_actor', {
      target: targetName,
      actor: actorName
    }) as string
    return preview.replace(/<[^>]*>/g, '')
  }

  if (action === 'LEAVE_GROUP') {
    if (String(senderId) === String(currentUserId)) {
      return translate('chat.system.leave_group.self') as string
    }
    const actorName = memberNameById.get(String(senderId)) || senderName || fallbackUserLabel
    const preview = translate('chat.system.leave_group.by_actor', { actor: actorName }) as string
    return preview.replace(/<[^>]*>/g, '')
  }

  if (action === 'UPDATE_NAME') {
    return translate('chat.system.add_members.update_name_simple', { newName: payload?.newName }) as string
  }

  if (action === 'UPDATE_AVATAR') {
    return translate('chat.system.add_members.update_avatar_simple') as string
  }

  if (action === 'GENERATE_JOIN_LINK' || action === 'REFRESH_JOIN_LINK') {
    const token = typeof payload?.token === 'string' ? payload.token : undefined
    const linkUrl = token ? `${window.location.origin}/g/${token}` : ''
    const label = translate('chat.system.join_link.label') as string
    return linkUrl ? `${label}: ${linkUrl}` : label
  }

  if (action === 'PROMOTE_ADMIN') {
    const normalizedCurrentUserId = String(currentUserId || '')
    const targetId = String((targetIds || [])[0] || '')
    const payloadTargetName = typeof payload?.targetName === 'string' ? String(payload.targetName) : undefined
    const targetName = memberNameById.get(targetId) ?? payloadTargetName ?? fallbackUserLabel

    if (targetId === normalizedCurrentUserId) {
      return translate('chat.system.promote_admin.self_promoted') as string
    }
    const preview = translate('chat.system.promote_admin.by_actor', { target: targetName }) as string
    return preview.replace(/<[^>]*>/g, '')
  }

  if (action === 'DEMOTE_ADMIN') {
    const normalizedCurrentUserId = String(currentUserId || '')
    const targetId = String((targetIds || [])[0] || '')
    const payloadTargetName = typeof payload?.targetName === 'string' ? String(payload.targetName) : undefined
    const targetName = memberNameById.get(targetId) ?? payloadTargetName ?? fallbackUserLabel

    if (targetId === normalizedCurrentUserId) {
      return translate('chat.system.demote_admin.self_demoted') as string
    }
    if (String(senderId) === String(currentUserId)) {
      const preview = translate('chat.system.demote_admin.by_you', { target: targetName }) as string
      return preview.replace(/<[^>]*>/g, '')
    }
    const preview = translate('chat.system.demote_admin.by_actor', { target: targetName }) as string
    return preview.replace(/<[^>]*>/g, '')
  }

  if (action === 'TRANSFER_OWNER') {
    const normalizedCurrentUserId = String(currentUserId || '')
    const targetId = String((targetIds || [])[0] || '')
    const payloadTargetName = typeof payload?.targetName === 'string' ? String(payload.targetName) : undefined
    const targetName = memberNameById.get(targetId) ?? payloadTargetName ?? fallbackUserLabel

    if (targetId === normalizedCurrentUserId) {
      return translate('chat.system.transfer_owner.self_promoted') as string
    }
    if (String(senderId) === String(currentUserId)) {
      const preview = translate('chat.system.transfer_owner.by_you', { target: targetName }) as string
      return preview.replace(/<[^>]*>/g, '')
    }
    const preview = translate('chat.system.transfer_owner.by_actor', { target: targetName }) as string
    return preview.replace(/<[^>]*>/g, '')
  }

  if (action === 'UPDATE_SETTINGS') {
    const setting = payload?.setting as string | undefined
    const value = payload?.value as boolean | undefined
    const isActorMe = String(senderId) === String(currentUserId)
    const actorName = memberNameById.get(String(senderId)) || senderName || fallbackUserLabel

    if (setting === 'memberCanSendMessages') {
      if (value === false) {
        if (isActorMe) return translate('chat.system.update_settings.send_messages_restricted_self') as string
        const p = translate('chat.system.update_settings.send_messages_restricted_other', {
          actor: actorName
        }) as string
        return p.replace(/<[^>]*>/g, '')
      }
      if (isActorMe) return translate('chat.system.update_settings.send_messages_allowed_self') as string
      const p = translate('chat.system.update_settings.send_messages_allowed_other', { actor: actorName }) as string
      return p.replace(/<[^>]*>/g, '')
    }
    if (setting === 'membershipApprovalEnabled') {
      return value === true
        ? (translate('chat.system.update_settings.membership_approval_required') as string)
        : (translate('chat.system.update_settings.membership_approval_none') as string)
    }
    if (setting === 'joinByLinkEnabled') {
      return translate('chat.system.update_settings.join_by_link_enabled') as string
    }
  }

  if (action === 'PIN_MESSAGE') {
    const actorName = memberNameById.get(String(senderId)) || senderName || fallbackUserLabel
    const isActorMe = String(senderId) === String(currentUserId)
    if (isActorMe) return translate('chat.system.pin_message.pinned_self') as string
    const p = translate('chat.system.pin_message.pinned_by_actor', { actor: actorName }) as string
    return p.replace(/<[^>]*>/g, '')
  }

  if (action === 'UNPIN_MESSAGE') {
    const actorName = memberNameById.get(String(senderId)) || senderName || fallbackUserLabel
    const isActorMe = String(senderId) === String(currentUserId)
    if (isActorMe) return translate('chat.system.pin_message.unpinned_self') as string
    const p = translate('chat.system.pin_message.unpinned_by_actor', { actor: actorName }) as string
    return p.replace(/<[^>]*>/g, '')
  }

  // Fallback to standard labels for other cases
  const label = getSystemMessageLabel(metadataRaw, senderId, undefined, currentUserId, members, translate, false)
  return typeof label === 'string' ? label : ''
}

