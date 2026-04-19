import type { ActionContext, ActionResolveResult } from './types'

export function resolveDemoteAdminAction(context: ActionContext): ActionResolveResult {
  const { normalizedTargetIds, normalizedCurrentUserId, senderId, currentUserId, members, translate } = context

  if (!normalizedTargetIds.length) return { directLabel: '' }

  const targetId = normalizedTargetIds[0]
  const isTargetMe = targetId === normalizedCurrentUserId
  const isActorMe = String(senderId) === String(currentUserId)
  const fallbackUserLabel = String(translate('chat.user'))
  const memberNameById = new Map(members.map((m) => [String(m.userId), m.fullName]))
  const payloadTargetName =
    typeof context.metadata?.payload?.targetName === 'string' ? String(context.metadata.payload.targetName) : undefined
  const targetName = isTargetMe
    ? String(translate('chat.you'))
    : (memberNameById.get(String(targetId)) ?? payloadTargetName ?? fallbackUserLabel)
  const clickableTargetIds = isTargetMe ? undefined : [targetId]

  if (isTargetMe) {
    return { i18nKey: 'chat.system.demote_admin.self_demoted' }
  }

  if (isActorMe) {
    return {
      i18nKey: 'chat.system.demote_admin.by_you',
      values: { target: targetName },
      clickableTargetIds
    }
  }

  return {
    i18nKey: 'chat.system.demote_admin.by_actor',
    values: { target: targetName }
  }
}
