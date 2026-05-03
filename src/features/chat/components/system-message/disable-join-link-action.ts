import type { ActionContext, ActionResolveResult } from './types'

export function resolveDisableJoinLinkAction(context: ActionContext): ActionResolveResult {
  const { senderId, currentUserId, actorNameCapital } = context
  const isActorMe = String(senderId) === String(currentUserId || '')

  return isActorMe
    ? { i18nKey: 'chat.system.disable_join_link.self' }
    : { i18nKey: 'chat.system.disable_join_link.by_actor', values: { actor: actorNameCapital } }
}
