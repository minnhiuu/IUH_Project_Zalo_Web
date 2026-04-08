import type { ActionContext, ActionResolveResult } from './types'

export function resolveUpdateAvatarAction(context: ActionContext): ActionResolveResult {
  const { actorNameCapital, actorNameLower } = context

  return {
    i18nKey: 'chat.system.add_members.update_avatar',
    values: { actor: actorNameCapital || actorNameLower }
  }
}
