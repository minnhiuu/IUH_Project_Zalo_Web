import type { ActionContext, ActionResolveResult } from './types'

export function resolveUpdateSettingsAction(context: ActionContext): ActionResolveResult {
  const { metadata, senderId, currentUserId, actorNameCapital, actorNameLower } = context

  const setting = metadata.payload?.setting as string | undefined
  const value = metadata.payload?.value as boolean | undefined
  const isActorMe = String(senderId) === String(currentUserId)
  const actorName = actorNameCapital || actorNameLower

  if (setting === 'memberCanSendMessages') {
    if (value === false) {
      return isActorMe
        ? { i18nKey: 'chat.system.update_settings.send_messages_restricted_self' }
        : { i18nKey: 'chat.system.update_settings.send_messages_restricted_other', values: { actor: actorName } }
    }
    return isActorMe
      ? { i18nKey: 'chat.system.update_settings.send_messages_allowed_self' }
      : { i18nKey: 'chat.system.update_settings.send_messages_allowed_other', values: { actor: actorName } }
  }

  if (setting === 'membershipApprovalEnabled') {
    return value === true
      ? { i18nKey: 'chat.system.update_settings.membership_approval_required' }
      : { i18nKey: 'chat.system.update_settings.membership_approval_none' }
  }

  if (setting === 'joinByLinkEnabled') {
    return { i18nKey: 'chat.system.update_settings.join_by_link_enabled' }
  }

  return { directLabel: '' }
}
