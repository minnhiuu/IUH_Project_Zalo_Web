import type { ActionContext, ActionResolveResult } from './types'

export function resolveQuietModeActiveAction({
  metadata,
  t,
}: ActionContext): ActionResolveResult {
  const actor = metadata.actorName || t('chat.user')

  return {
    content: t('chat.system.quiet_mode_active', { actor }),
  }
}
