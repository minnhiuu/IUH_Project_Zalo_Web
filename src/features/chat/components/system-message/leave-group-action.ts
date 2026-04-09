import type { ActionContext, ActionResolveResult } from './types'

export function resolveLeaveGroupAction(context: ActionContext): ActionResolveResult {
  const { senderId, currentUserId } = context

  if (String(senderId) === String(currentUserId || '')) {
    return { i18nKey: 'chat.system.leave_group.self' }
  }

  return { i18nKey: 'chat.system.leave_group.by_actor' }
}
