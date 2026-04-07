import type { ActionContext, ActionResolveResult } from './types'

export function resolveAddMembersAction(context: ActionContext): ActionResolveResult {
  const { normalizedTargetIds, normalizedCurrentUserId, senderId, currentUserId, members, actorNameLower, translate } =
    context

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
    const otherTargetNames = otherTargets.map(
      (id) => members.find((m) => String(m.userId) === String(id))?.fullName || 'User'
    )

    if (otherTargets.length <= 3) {
      values.targets = otherTargetNames.join(', ')
      return {
        i18nKey: 'chat.system.add_members.many_self',
        values,
        clickableTargetIds: otherTargets
      }
    }

    values.targets = otherTargetNames.slice(0, 3).join(', ')
    values.count = otherTargets.length - 3
    return {
      i18nKey: 'chat.system.add_members.many_self_count',
      values,
      clickableTargetIds: otherTargets
    }
  }

  const targetNames = normalizedTargetIds.map(
    (id) => members.find((m) => String(m.userId) === String(id))?.fullName || 'User'
  )

  if (normalizedTargetIds.length === 1) {
    values.target = targetNames[0] || 'User'
    return {
      i18nKey: 'chat.system.add_members.single_other',
      values,
      clickableTargetIds: normalizedTargetIds
    }
  }

  if (normalizedTargetIds.length <= 4) {
    values.targets = targetNames.join(', ')
    return {
      i18nKey: 'chat.system.add_members.many_other',
      values,
      clickableTargetIds: normalizedTargetIds
    }
  }

  values.targets = targetNames.slice(0, 4).join(', ')
  values.count = normalizedTargetIds.length - 4

  return {
    i18nKey: 'chat.system.add_members.many_other_count',
    values,
    clickableTargetIds: normalizedTargetIds
  }
}
