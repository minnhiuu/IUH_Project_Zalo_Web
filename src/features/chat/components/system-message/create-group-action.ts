import type { ActionContext, ActionResolveResult } from './types'
import { resolveAddMembersAction } from './add-members-action'

export function resolveCreateGroupAction(context: ActionContext): ActionResolveResult {
  return resolveAddMembersAction(context)
}
