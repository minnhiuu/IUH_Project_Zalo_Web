import type { ActionContext, ActionResolveResult } from './types'

export function resolvePinMessageAction(context: ActionContext): ActionResolveResult {
  const { actorNameCapital, currentUserId, senderId } = context
  const isActorMe = currentUserId && String(senderId) === String(currentUserId)
  return {
    i18nKey: isActorMe ? 'chat.system.pin_message.pinned_self' : 'chat.system.pin_message.pinned_by_actor',
    values: { actor: actorNameCapital }
  }
}

export function resolveUnpinMessageAction(context: ActionContext): ActionResolveResult {
  const { actorNameCapital, currentUserId, senderId } = context
  const isActorMe = currentUserId && String(senderId) === String(currentUserId)
  return {
    i18nKey: isActorMe ? 'chat.system.pin_message.unpinned_self' : 'chat.system.pin_message.unpinned_by_actor',
    values: { actor: actorNameCapital }
  }
}
