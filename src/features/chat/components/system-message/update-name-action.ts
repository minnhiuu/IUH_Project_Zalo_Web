import type { ActionContext, ActionResolveResult } from './types'

export function resolveUpdateNameAction(context: ActionContext): ActionResolveResult {
  const { metadata, actorNameCapital, actorNameLower } = context

  return {
    i18nKey: 'chat.system.add_members.update_name',
    values: {
      actor: actorNameCapital || actorNameLower,
      oldName: String(metadata.payload?.oldName || ''),
      newName: String(metadata.payload?.newName || '')
    }
  }
}
