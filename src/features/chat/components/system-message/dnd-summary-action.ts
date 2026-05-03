import type { ActionContext, ActionResolveResult } from './types'

export function resolveDndSummaryAction({
  metadata,
  t,
}: ActionContext): ActionResolveResult {
  const count = metadata.payload?.count || 0

  return {
    content: t('chat.system.dnd_summary', { count }),
  }
}
