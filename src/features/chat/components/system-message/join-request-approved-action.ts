import type { ActionContext, ActionResolveResult } from './types'

export function resolveJoinRequestApprovedAction(context: ActionContext): ActionResolveResult {
  const { normalizedTargetIds, normalizedCurrentUserId, senderId, currentUserId, members, translate } = context
  const fallbackUserLabel = String(translate('chat.user'))
  const memberNameById = new Map(members.map((m) => [String(m.userId), m.fullName]))
  const payloadTargetNames = Array.isArray(context.metadata?.payload?.targetNames)
    ? context.metadata.payload.targetNames.map(String)
    : []
  const resolveTargetName = (id: string, index: number) =>
    memberNameById.get(String(id)) || payloadTargetNames[index] || fallbackUserLabel

  if (!normalizedTargetIds.length) return {}

  const targetName = resolveTargetName(normalizedTargetIds[0], 0)
  const isSelfApproved = normalizedTargetIds.includes(normalizedCurrentUserId)

  if (isSelfApproved) {
    return { i18nKey: 'chat.system.join_request_approved.self', values: { actor: context.actorNameLower } }
  }

  if (String(senderId) === String(currentUserId || '')) {
    return {
      i18nKey: 'chat.system.join_request_approved.by_me',
      values: { target: targetName },
      clickableTargetIds: normalizedTargetIds
    }
  }

  return {
    i18nKey: 'chat.system.join_request_approved.by_actor',
    values: { actor: context.actorNameLower, target: targetName },
    clickableTargetIds: normalizedTargetIds
  }
}
