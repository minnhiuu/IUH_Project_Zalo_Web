import type { ActionContext, ActionResolveResult } from './types'

export function resolveUpdateExpirationAction(context: ActionContext): ActionResolveResult {
  const { metadata, actorNameCapital, translate } = context
  const days = ((metadata as Record<string, any>).days as number) || 0

  if (days === 0) {
    return {
      directLabel: `${actorNameCapital} ${translate('chat.system.update_expiration.off')}`
    }
  }

  return {
    directLabel: `${actorNameCapital} ${translate('chat.system.update_expiration.on', { days })}`
  }
}
