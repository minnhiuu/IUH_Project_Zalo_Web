import type { ActionContext, ActionResolveResult } from './types'
import { resolveAddMembersAction } from './add-members-action'
import { resolveCreateGroupAction } from './create-group-action'
import { resolveDisbandGroupAction } from './disband-group-action'
import { resolveRemoveMemberAction } from './remove-member-action'
import { resolveUpdateAvatarAction } from './update-avatar-action'
import { resolveUpdateNameAction } from './update-name-action'

export function resolveSystemAction(context: ActionContext): ActionResolveResult {
  const { metadata } = context

  switch (metadata.action) {
    case 'CREATE_GROUP':
      return resolveCreateGroupAction(context)
    case 'ADD_MEMBERS':
      return resolveAddMembersAction(context)
    case 'REMOVE_MEMBER':
      return resolveRemoveMemberAction(context)
    case 'UPDATE_NAME':
      return resolveUpdateNameAction(context)
    case 'UPDATE_AVATAR':
      return resolveUpdateAvatarAction(context)
    case 'DISBAND_GROUP':
      return resolveDisbandGroupAction()
    default:
      return {}
  }
}
