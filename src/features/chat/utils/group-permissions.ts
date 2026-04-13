import type { ConversationResponse } from '../schemas/chat.schema'
import { GroupMemberRole } from '@/constants/enum'

type Role = (typeof GroupMemberRole)[keyof typeof GroupMemberRole]

function getUserRole(conversation: ConversationResponse, userId: string): Role {
  const member = conversation.members?.find((m) => m.userId === userId)
  return (member?.role?.toUpperCase() as Role) || GroupMemberRole.Member
}

function isAdminOrOwner(role: Role): boolean {
  return role === GroupMemberRole.Owner || role === GroupMemberRole.Admin
}

/**
 * Check if a user can send messages in a group conversation.
 * When `memberCanSendMessages` is false, only OWNER/ADMIN can send.
 */
export function canSendMessages(conversation: ConversationResponse, userId: string): boolean {
  if (!conversation.isGroup) return true
  if (conversation.settings?.memberCanSendMessages !== false) return true
  return isAdminOrOwner(getUserRole(conversation, userId))
}

/**
 * Check if a user can change group info (name, avatar).
 * When `memberCanChangeInfo` is false, only OWNER/ADMIN can change.
 */
export function canChangeGroupInfo(conversation: ConversationResponse, userId: string): boolean {
  if (!conversation.isGroup) return true
  if (conversation.settings?.memberCanChangeInfo !== false) return true
  return isAdminOrOwner(getUserRole(conversation, userId))
}

/**
 * Check if a user can pin messages, notes, and polls to the top.
 * When `memberCanPinMessages` is false, only OWNER/ADMIN can pin.
 */
export function canPinMessages(conversation: ConversationResponse, userId: string): boolean {
  if (!conversation.isGroup) return true
  if (conversation.settings?.memberCanPinMessages !== false) return true
  return isAdminOrOwner(getUserRole(conversation, userId))
  // TODO: Wire this when pin messages API is implemented
}

/**
 * Check if a user can create notes and reminders.
 * When `memberCanCreateNotes` is false, only OWNER/ADMIN can create.
 */
export function canCreateNotes(conversation: ConversationResponse, userId: string): boolean {
  if (!conversation.isGroup) return true
  if (conversation.settings?.memberCanCreateNotes !== false) return true
  return isAdminOrOwner(getUserRole(conversation, userId))
  // TODO: Wire this when notes/reminders API is implemented
}

/**
 * Check if a user can create polls.
 * When `memberCanCreatePolls` is false, only OWNER/ADMIN can create.
 */
export function canCreatePolls(conversation: ConversationResponse, userId: string): boolean {
  if (!conversation.isGroup) return true
  if (conversation.settings?.memberCanCreatePolls !== false) return true
  return isAdminOrOwner(getUserRole(conversation, userId))
  // TODO: Wire this when polls API is implemented
}
