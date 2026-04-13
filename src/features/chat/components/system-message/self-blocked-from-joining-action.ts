import type { ActionContext, ActionResolveResult } from './types'

export function resolveSelfBlockedFromJoiningAction(context: ActionContext): ActionResolveResult {
  const { normalizedTargetIds, members, translate } = context

  if (!normalizedTargetIds.length) {
    return { directLabel: '' }
  }

  const targetId = normalizedTargetIds[0]
  const fallbackUserLabel = String(translate('chat.user'))
  const memberNameById = new Map(members.map((m) => [String(m.userId), m.fullName]))
  const payloadTargetName =
    typeof context.metadata?.payload?.targetName === 'string' ? String(context.metadata.payload.targetName) : undefined
  const targetName = memberNameById.get(String(targetId)) ?? payloadTargetName ?? fallbackUserLabel
  const joinLinkEnabled = context.metadata?.payload?.joinLinkEnabled === true

  const i18nKey = joinLinkEnabled
    ? 'chat.system.self_blocked_from_joining.with_link'
    : 'chat.system.self_blocked_from_joining.without_link'

  return {
    i18nKey,
    values: { target: targetName },
    clickableTargetIds: targetId ? [targetId] : undefined
  }
}
