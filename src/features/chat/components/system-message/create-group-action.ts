import type { ActionContext, ActionResolveResult } from './types'

export function resolveCreateGroupAction(context: ActionContext): ActionResolveResult {
  const { normalizedTargetIds, normalizedCurrentUserId, currentUserId, senderId, translate } = context
  const isSelfInTargets = normalizedTargetIds.includes(normalizedCurrentUserId)
  const isActorMe = currentUserId && String(senderId) === String(currentUserId)

  if (isActorMe) {
    return { directLabel: translate('chat.system.add_members.group_created') }
  }

  if (isSelfInTargets) {
    return { directLabel: translate('chat.system.add_members.joined_group') }
  }

  return { i18nKey: 'chat.system.add_members.group_created' }
}
