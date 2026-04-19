import type { ActionContext, ActionResolveResult } from './types'

export function resolveAddMembersFailedAction(context: ActionContext): ActionResolveResult {
  const { metadata, translate } = context
  const failedCount = (metadata?.payload?.failedCount as number) || context.normalizedTargetIds.length || 0

  return {
    directLabel: String(translate('chat.system.add_members_failed', { count: failedCount }))
  }
}
