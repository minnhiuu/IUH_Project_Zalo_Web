import type { ActionContext, ActionResolveResult } from './types'
import { resolveAddMembersAction } from './add-members-action'
import { resolveCreateGroupAction } from './create-group-action'
import { resolveDisbandGroupAction } from './disband-group-action'
import { resolveLeaveGroupAction } from './leave-group-action'
import { resolveRemoveMemberAction } from './remove-member-action'
import { resolveUpdateAvatarAction } from './update-avatar-action'
import { resolveUpdateNameAction } from './update-name-action'
import { resolvePromoteAdminAction } from './promote-admin-action'
import { resolveDemoteAdminAction } from './demote-admin-action'
import { resolveTransferOwnerAction } from './transfer-owner-action'
import { resolveUpdateSettingsAction } from './update-settings-action'
import { resolveJoinByLinkAction } from './join-by-link-action'
import { resolveGenerateJoinLinkAction } from './generate-join-link-action'
import { resolveRefreshJoinLinkAction } from './refresh-join-link-action'
import { resolvePinMessageAction, resolveUnpinMessageAction } from './pin-message-action'

export function resolveSystemAction(context: ActionContext): ActionResolveResult {
  const { metadata } = context

  switch (metadata.action) {
    case 'CREATE_GROUP':
      return resolveCreateGroupAction(context)
    case 'ADD_MEMBERS':
      return resolveAddMembersAction(context)
    case 'REMOVE_MEMBER':
      return resolveRemoveMemberAction(context)
    case 'LEAVE_GROUP':
      return resolveLeaveGroupAction(context)
    case 'UPDATE_NAME':
      return resolveUpdateNameAction(context)
    case 'UPDATE_AVATAR':
      return resolveUpdateAvatarAction(context)
    case 'DISBAND_GROUP':
      return resolveDisbandGroupAction()
    case 'PROMOTE_ADMIN':
      return resolvePromoteAdminAction(context)
    case 'DEMOTE_ADMIN':
      return resolveDemoteAdminAction(context)
    case 'TRANSFER_OWNER':
      return resolveTransferOwnerAction(context)
    case 'UPDATE_SETTINGS':
      return resolveUpdateSettingsAction(context)
    case 'JOIN_BY_LINK':
      return resolveJoinByLinkAction(context)
    case 'GENERATE_JOIN_LINK':
      return resolveGenerateJoinLinkAction(context)
    case 'REFRESH_JOIN_LINK':
      return resolveRefreshJoinLinkAction(context)
    case 'PIN_MESSAGE':
      return resolvePinMessageAction(context)
    case 'UNPIN_MESSAGE':
      return resolveUnpinMessageAction(context)
    default:
      return {}
  }
}
