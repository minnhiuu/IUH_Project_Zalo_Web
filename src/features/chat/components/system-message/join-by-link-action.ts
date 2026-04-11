import type { ActionContext, ActionResolveResult } from './types'

export function resolveJoinByLinkAction(context: ActionContext): ActionResolveResult {
  const { senderId, currentUserId } = context

  if (String(senderId) === String(currentUserId || '')) {
    return { i18nKey: 'chat.system.join_by_link.self' }
  }

  return { i18nKey: 'chat.system.join_by_link.by_actor' }
}
