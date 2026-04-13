import type { ActionResolveResult } from './types'

export function resolveJoinRequestRejectedAction(): ActionResolveResult {
  return { i18nKey: 'chat.system.join_request_rejected.self' }
}
