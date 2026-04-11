import type { ActionContext, ActionResolveResult } from './types'

export function resolveJoinRequestCreatedAction(context: ActionContext): ActionResolveResult {
  const { senderId, currentUserId } = context

  if (String(senderId) === String(currentUserId || '')) {
    return { i18nKey: 'chat.system.join_request_created.self' }
  }

  return { i18nKey: 'chat.system.join_request_created.by_actor' }
}
