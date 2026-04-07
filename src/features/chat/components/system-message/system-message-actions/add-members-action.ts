import type { ActionContext, ActionResolveResult } from './types'

export function resolveAddMembersAction(context: ActionContext): ActionResolveResult {
  const { normalizedTargetIds, normalizedCurrentUserId, senderId, currentUserId, members, actorNameLower, translate } =
    context
  const fallbackUserLabel = String(translate('chat.user'))
  const memberNameById = new Map(members.map((m) => [String(m.userId), m.fullName]))
  const payloadTargetNames = Array.isArray(context.metadata?.payload?.targetNames)
    ? context.metadata.payload.targetNames.map(String)
    : []
  const resolveTargetName = (id: string, index: number) =>
    memberNameById.get(String(id)) || payloadTargetNames[index] || fallbackUserLabel

  if (!normalizedTargetIds.length) {
    if (String(senderId) === String(currentUserId)) return { directLabel: '' }
    return { directLabel: translate('chat.system.add_members.joined_group') }
  }

  const values: Record<string, string | number> = { actor: actorNameLower }
  const isSelfAdded = normalizedTargetIds.includes(normalizedCurrentUserId)

  if (isSelfAdded) {
    if (normalizedTargetIds.length === 1) {
      return { i18nKey: 'chat.system.add_members.single_self', values }
    }

    const otherTargets = normalizedTargetIds.filter((id) => id !== normalizedCurrentUserId)
    const otherTargetNames = otherTargets.map((id) => {
      const idx = normalizedTargetIds.findIndex((targetId) => targetId === id)
      return resolveTargetName(id, idx)
    })
    const clickableOtherTargets = otherTargets

    if (otherTargets.length <= 3) {
      values.targets = otherTargetNames.join(', ')
      return {
        i18nKey: 'chat.system.add_members.many_self',
        values,
        clickableTargetIds: clickableOtherTargets
      }
    }

    values.targets = otherTargetNames.slice(0, 3).join(', ')
    values.count = otherTargets.length - 3
    return {
      i18nKey: 'chat.system.add_members.many_self_count',
      values,
      clickableTargetIds: clickableOtherTargets
    }
  }

  const targetNames = normalizedTargetIds.map((id, index) => resolveTargetName(id, index))
  const clickableTargetIds = normalizedTargetIds

  if (normalizedTargetIds.length === 1) {
    values.target = targetNames[0] || fallbackUserLabel
    return {
      i18nKey: 'chat.system.add_members.single_other',
      values,
      clickableTargetIds
    }
  }

  if (normalizedTargetIds.length <= 4) {
    values.targets = targetNames.join(', ')
    return {
      i18nKey: 'chat.system.add_members.many_other',
      values,
      clickableTargetIds
    }
  }

  values.targets = targetNames.slice(0, 4).join(', ')
  values.count = normalizedTargetIds.length - 4

  return {
    i18nKey: 'chat.system.add_members.many_other_count',
    values,
    clickableTargetIds
  }
}
