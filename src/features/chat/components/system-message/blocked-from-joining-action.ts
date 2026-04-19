import type { ActionContext, ActionResolveResult } from './types'

export function resolveBlockedFromJoiningAction(context: ActionContext): ActionResolveResult {
  const { normalizedTargetIds, normalizedCurrentUserId, members, translate } = context

  if (!normalizedTargetIds.length) {
    return { directLabel: '' }
  }

  const targetId = normalizedTargetIds[0]
  const fallbackUserLabel = String(translate('chat.user'))
  const memberNameById = new Map(members.map((m) => [String(m.userId), m.fullName]))
  const payloadTargetName =
    typeof context.metadata?.payload?.targetName === 'string' ? String(context.metadata.payload.targetName) : undefined
  const targetName =
    targetId === normalizedCurrentUserId
      ? String(translate('chat.you'))
      : (memberNameById.get(String(targetId)) ?? payloadTargetName ?? fallbackUserLabel)
  const clickableTargetIds = targetId ? [targetId] : undefined

  return {
    i18nKey: 'chat.system.blocked_from_joining',
    values: { target: targetName },
    clickableTargetIds
  }
}
