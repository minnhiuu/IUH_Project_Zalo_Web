import type { ActionContext, ActionResolveResult } from './types'

export function resolveQuietModeActiveAction({ actorNameCapital }: ActionContext): ActionResolveResult {
  return {
    i18nKey: 'chat.system.quiet_mode_active',
    values: { actor: actorNameCapital }
  }
}
