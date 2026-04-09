import type { ActionContext, ActionResolveResult } from './types'

export function resolveRemoveMemberAction(context: ActionContext): ActionResolveResult {
  const { normalizedTargetIds, normalizedCurrentUserId, senderId, currentUserId, members, actorNameLower, translate } =
    context

  if (!normalizedTargetIds.length) {
    return { directLabel: '' }
  }

  const targetId = normalizedTargetIds[0]
  const isTargetMe = targetId === normalizedCurrentUserId
  const isActorMe = String(senderId) === String(currentUserId)
  const fallbackUserLabel = String(translate('chat.user'))
  const memberNameById = new Map(members.map((m) => [String(m.userId), m.fullName]))
  const payloadTargetName =
    typeof context.metadata?.payload?.targetName === 'string' ? String(context.metadata.payload.targetName) : undefined
  const targetMemberName = memberNameById.get(String(targetId))
  const targetName = isTargetMe
    ? String(translate('chat.you'))
    : (targetMemberName ?? payloadTargetName ?? fallbackUserLabel)
  const clickableTargetIds = targetId ? [targetId] : undefined

  if (isTargetMe) {
    return { i18nKey: 'chat.system.remove_member.self_removed' }
  }

  if (isActorMe) {
    return {
      i18nKey: 'chat.system.remove_member.by_you',
      values: { target: targetName },
      clickableTargetIds
    }
  }

  return {
    i18nKey: 'chat.system.remove_member.by_actor',
    values: {
      actor: actorNameLower,
      target: targetName
    },
    clickableTargetIds
  }
}
