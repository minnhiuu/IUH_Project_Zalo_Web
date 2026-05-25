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
import { resolveJoinRequestCreatedAction } from './join-request-created-action'
import { resolveJoinRequestApprovedAction } from './join-request-approved-action'
import { resolveJoinRequestRejectedAction } from './join-request-rejected-action'
import { resolveBlockMemberAction } from './block-member-action'
import { resolveBlockedFromJoiningAction } from './blocked-from-joining-action'
import { resolveSelfBlockedFromJoiningAction } from './self-blocked-from-joining-action'
import { resolveAddMembersFailedAction } from './add-members-failed-action'
import { resolveDisableJoinLinkAction } from './disable-join-link-action'
import { resolveQuietModeActiveAction } from './quiet-mode-active-action'
import { resolveUpdateExpirationAction } from './update-expiration-action'

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
    case 'DISABLE_JOIN_LINK':
      return resolveDisableJoinLinkAction(context)
    case 'PIN_MESSAGE':
      return resolvePinMessageAction(context)
    case 'UNPIN_MESSAGE':
      return resolveUnpinMessageAction(context)
    case 'JOIN_REQUEST_CREATED':
      return resolveJoinRequestCreatedAction(context)
    case 'JOIN_REQUEST_APPROVED':
      return resolveJoinRequestApprovedAction(context)
    case 'JOIN_REQUEST_REJECTED':
      return resolveJoinRequestRejectedAction()
    case 'BLOCK_MEMBER':
      return resolveBlockMemberAction(context)
    case 'BLOCKED_FROM_JOINING':
      return resolveBlockedFromJoiningAction(context)
    case 'SELF_BLOCKED_FROM_JOINING':
      return resolveSelfBlockedFromJoiningAction(context)
    case 'ADD_MEMBERS_FAILED':
      return resolveAddMembersFailedAction(context)
    case 'QUIET_MODE_ACTIVE':
    case 'DND_AUTO_REPLY':
      return resolveQuietModeActiveAction(context)
    case 'UPDATE_EXPIRATION':
      return resolveUpdateExpirationAction(context)
    default:
      return {}
  }
}
