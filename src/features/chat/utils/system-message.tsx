import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '../../auth/hooks/use-auth'
import { useChatText } from '../i18n/use-chat-text'
import type { MessageResponse, ConversationResponse } from '../schemas/chat.schema'
import { MemberAvatar } from '../components/group/members/member-avatar'
import { useDeleteConversationMutation } from '../queries/use-mutations'
import { OthersProfileDialog } from '@/features/user'
import { getSystemMessageLabel, type SystemMetadata } from './system-message-label'
import { PromoteAdminCard } from '../components/group/cards/promote-admin-card'
import { OwnerCard } from '../components/group/cards/owner-card'
import { Key, X, Link2 } from 'lucide-react'
import { showSimpleToast } from '@/utils/toast'
import { ForwardDialog } from '../components/forward-dialog'
import { useChatContext } from '../context/chat-context'
import { JoinRequestApprovalDialog } from '../components/group/dialogs/join-request-approval-dialog'
import { UserAvatar } from '@/components/common/user-avatar'
import { stripMentionsForPreview } from './mention'

export { getSystemMessageLabel } from './system-message-label'
export type { SystemActionType, SystemMetadata } from './system-message-label'

export interface SystemMessageProps {
  message: MessageResponse
  conversation?: ConversationResponse
}

export function SystemMessage({ message, conversation }: SystemMessageProps) {
  const { user } = useAuth()
  const { t } = useChatText()
  const { sendMessage } = useChatContext()
  const { mutate: deleteConversation } = useDeleteConversationMutation()
  const [profileUserId, setProfileUserId] = useState<string | undefined>(undefined)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isJoinLinkShareOpen, setIsJoinLinkShareOpen] = useState(false)
  const [isJoinRequestDialogOpen, setIsJoinRequestDialogOpen] = useState(false)

  const handleOpenProfile = useCallback(
    (userId: string) => {
      const normalizedUserId = String(userId || '').trim()
      if (!normalizedUserId || normalizedUserId === String(user?.id)) return
      setProfileUserId(normalizedUserId)
      setIsProfileOpen(true)
    },
    [user?.id]
  )

  const { systemLabel, targetAvatars } = useMemo(() => {
    const metadata = message.metadata as unknown as SystemMetadata | null | undefined

    // CREATE_GROUP is resolved as ADD_MEMBERS in resolve-system-action
    const label = getSystemMessageLabel(
      message.metadata,
      message.senderId === null ? undefined : message.senderId,
      message.senderName === null ? undefined : message.senderName,
      user?.id,
      conversation?.members || [],
      t,
      true,
      handleOpenProfile
    )

    let avatars: { id: string; avatar?: string | null; name: string }[] = []
    const payload = metadata?.payload as Record<string, unknown> | undefined
    if ((metadata?.action === 'ADD_MEMBERS' || metadata?.action === 'CREATE_GROUP') && metadata.targetIds) {
      const targetNames = (payload?.targetNames as string[]) || []
      const targetAvatarList = (payload?.targetAvatars as string[]) || []
      avatars = metadata.targetIds.map((id, index) => ({
        id,
        avatar: targetAvatarList[index] || null,
        name: targetNames[index] || t('chat.user')
      }))
    } else if (metadata?.action === 'LEAVE_GROUP' && message.senderId) {
      avatars = [{ id: message.senderId, avatar: message.senderAvatar, name: message.senderName || t('chat.user') }]
    } else if (metadata?.action === 'JOIN_BY_LINK' && message.senderId) {
      avatars = [{ id: message.senderId, avatar: message.senderAvatar, name: message.senderName || t('chat.user') }]
    } else if (metadata?.action === 'JOIN_REQUEST_CREATED' && message.senderId) {
      avatars = [{ id: message.senderId, avatar: message.senderAvatar, name: message.senderName || t('chat.user') }]
    } else if (
      (metadata?.action === 'GENERATE_JOIN_LINK' || metadata?.action === 'REFRESH_JOIN_LINK') &&
      message.senderId
    ) {
      avatars = [{ id: message.senderId, avatar: message.senderAvatar, name: message.senderName || t('chat.user') }]
    } else if (metadata?.action === 'JOIN_REQUEST_APPROVED' && metadata.targetIds) {
      const targetNames = (payload?.targetNames as string[]) || []
      const targetAvatarList = (payload?.targetAvatars as string[]) || []
      avatars = metadata.targetIds.map((id, index) => ({
        id,
        avatar: targetAvatarList[index] || null,
        name: targetNames[index] || t('chat.user')
      }))
    } else if (metadata?.action === 'REMOVE_MEMBER' && metadata.targetIds) {
      const targetAvatar = (payload?.targetAvatar as string) || null
      const targetName = (payload?.targetName as string) || t('chat.user')
      avatars = metadata.targetIds.map((id) => ({
        id,
        avatar: targetAvatar,
        name: targetName
      }))
    } else if (metadata?.action === 'BLOCK_MEMBER' && metadata.targetIds) {
      const targetAvatar = (payload?.targetAvatar as string) || null
      const targetName = (payload?.targetName as string) || t('chat.user')
      avatars = metadata.targetIds.map((id) => ({
        id,
        avatar: targetAvatar,
        name: targetName
      }))
    } else if (metadata?.action === 'BLOCKED_FROM_JOINING' && metadata.targetIds) {
      const targetAvatar = (payload?.targetAvatar as string) || null
      const targetName = (payload?.targetName as string) || t('chat.user')
      avatars = metadata.targetIds.map((id) => ({
        id,
        avatar: targetAvatar,
        name: targetName
      }))
    } else if (metadata?.action === 'SELF_BLOCKED_FROM_JOINING' && metadata.targetIds) {
      const targetAvatar = (payload?.targetAvatar as string) || null
      const targetName = (payload?.targetName as string) || t('chat.user')
      avatars = metadata.targetIds.map((id) => ({
        id,
        avatar: targetAvatar,
        name: targetName
      }))
    }

    return { systemLabel: label, targetAvatars: avatars }
  }, [message, conversation, user?.id, t, handleOpenProfile])

  const metadata = message.metadata as unknown as SystemMetadata | undefined

  if (metadata?.action === 'GENERATE_JOIN_LINK' || metadata?.action === 'REFRESH_JOIN_LINK') {
    const payload = metadata?.payload as Record<string, unknown> | undefined
    const storedToken = payload?.token as string | undefined
    const linkUrl = storedToken ? `${window.location.origin}/g/${storedToken}` : null
    const isCurrentToken = storedToken && storedToken === conversation?.joinLinkToken
    const currentUserMember = conversation?.members?.find((m) => String(m.userId) === String(user?.id))
    const isAdminOrOwner = currentUserMember?.role === 'ADMIN' || currentUserMember?.role === 'OWNER'

    const handleCopyLink = () => {
      if (!linkUrl) return
      if (isAdminOrOwner && !isCurrentToken) {
        showSimpleToast(t('chat.system.join_link.expired'), 3000)
        return
      }
      navigator.clipboard.writeText(linkUrl)
      showSimpleToast(t('chat.system.join_link.copied'))
    }

    const handleLinkClick = () => {
      handleCopyLink()
    }

    return (
      <>
        <div className='flex justify-center w-full my-2.5 px-4'>
          <div className='system-msg flex items-center gap-2.5 py-1.5 px-3.5 max-w-[95%]'>
            <Link2 className='w-5 h-5 text-information shrink-0' />
            <div className='flex-1 text-[12.5px] leading-relaxed text-left'>
              {t('chat.system.join_link.label')}:{' '}
              {linkUrl && (
                <span
                  className='text-information break-all underline cursor-pointer hover:underline'
                  onClick={handleLinkClick}
                >
                  {linkUrl}
                </span>
              )}
              <span className='ml-1.5 whitespace-nowrap'>
                <button
                  className='font-medium text-[12px] cursor-pointer hover:text-information'
                  onClick={handleCopyLink}
                >
                  {t('chat.system.join_link.copy')}
                </button>
                <span className='mx-1 text-muted-foreground'>|</span>
                <button
                  className='font-medium text-[12px] cursor-pointer hover:text-information'
                  onClick={() => setIsJoinLinkShareOpen(true)}
                >
                  {t('chat.system.join_link.share')}
                </button>
              </span>
            </div>
          </div>
        </div>
        {linkUrl && (
          <ForwardDialog
            open={isJoinLinkShareOpen}
            onClose={() => setIsJoinLinkShareOpen(false)}
            onConfirm={(selectedConvIds) => {
              selectedConvIds.forEach((convId) => {
                sendMessage(convId, linkUrl)
              })
            }}
          />
        )}
      </>
    )
  }

  if (!systemLabel) return null
  const isDisbanded = metadata?.action === 'DISBAND_GROUP'
  const isCurrentUserRemoved =
    (metadata?.action === 'REMOVE_MEMBER' || metadata?.action === 'BLOCK_MEMBER') &&
    (metadata.targetIds || []).map(String).includes(String(user?.id || ''))
  const isCurrentUserLeftGroup =
    metadata?.action === 'LEAVE_GROUP' && String(message.senderId || '') === String(user?.id || '')
  const showDeleteConversationAction = isDisbanded || isCurrentUserRemoved || isCurrentUserLeftGroup

  const isJoinRequestCreated =
    metadata?.action === 'JOIN_REQUEST_CREATED' && String(message.senderId || '') !== String(user?.id || '')

  const isPromotedToAdmin =
    metadata?.action === 'PROMOTE_ADMIN' && (metadata.targetIds || []).map(String).includes(String(user?.id || ''))
  const isTransferredOwner =
    metadata?.action === 'TRANSFER_OWNER' && (metadata.targetIds || []).map(String).includes(String(user?.id || ''))

  return (
    <>
      {(metadata?.action === 'PIN_MESSAGE' || metadata?.action === 'UNPIN_MESSAGE') &&
        (metadata.originalContent || metadata.contentSnapshot) ? (
        <div className='flex justify-center w-full my-2.5 px-4'>
          <div className='system-msg flex items-center gap-2 py-1.5 px-3.5 max-w-[95%]'>
            <UserAvatar
              name={String(metadata.originalSenderName || t('chat.user'))}
              src={metadata.originalSenderAvatar ? String(metadata.originalSenderAvatar) : undefined}
              className='w-5 h-5 shrink-0'
              fallbackClassName='text-[10px]'
            />
            <div className='flex-1 text-[12.5px] leading-relaxed text-left flex items-center gap-1 overflow-hidden'>
              <span className='font-semibold shrink-0'>{String(metadata.originalSenderName || t('chat.user'))}</span>
              <span className='shrink-0'>
                {metadata.action === 'PIN_MESSAGE'
                  ? String(t('chat.messageBubble.pinMessage')).toLowerCase()
                  : String(t('chat.pinBoard.unpin')).toLowerCase()}
              </span>
              <span className='opacity-80 border-l border-foreground/30 pl-1.5 ml-0.5 truncate block max-w-[150px] sm:max-w-[250px] md:max-w-[350px] xl:max-w-[450px]'>
                {stripMentionsForPreview(String(metadata.originalContent || metadata.contentSnapshot))}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className='flex justify-center w-full my-2.5 px-4'>
          <div className='system-msg flex items-center gap-2.5 py-1.5 px-3.5 max-w-[95%]'>
            {targetAvatars.length > 0 && <MemberAvatar members={targetAvatars} size='xs' className='shrink-0' />}
            <div className='flex-1 text-[12.5px] leading-relaxed text-left flex items-center gap-1.5'>
              {metadata?.action === 'TRANSFER_OWNER' && <Key className='system-msg-owner-icon shrink-0' />}
              {metadata?.action === 'PROMOTE_ADMIN' && <Key className='system-msg-promote-icon shrink-0' />}
              {metadata?.action === 'DEMOTE_ADMIN' && (
                <div className='relative shrink-0'>
                  <Key className='system-msg-promote-icon' />
                  <X className='absolute -bottom-1 -right-1.5 w-2 h-2 system-msg-promote-icon stroke-3 mr-2' />
                </div>
              )}
              {systemLabel}
              {showDeleteConversationAction && (
                <button
                  onClick={() => {
                    if (conversation?.id) {
                      deleteConversation(conversation.id)
                    }
                  }}
                  className='text-information hover:underline font-medium whitespace-nowrap cursor-pointer'
                >
                  {t('chat.disbanded.deleteAction')}
                </button>
              )}
              {isJoinRequestCreated && (
                <button
                  onClick={() => setIsJoinRequestDialogOpen(true)}
                  className='text-information hover:underline font-medium whitespace-nowrap cursor-pointer'
                >
                  {t('chat.joinRequestDialog.detail')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isPromotedToAdmin && <PromoteAdminCard conversation={conversation} secondaryLabel={null} t={t} />}

      {isTransferredOwner && <OwnerCard conversation={conversation} secondaryLabel={null} t={t} />}

      <OthersProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} userId={profileUserId} />

      {isJoinRequestCreated && conversation?.id && (
        <JoinRequestApprovalDialog
          open={isJoinRequestDialogOpen}
          onOpenChange={setIsJoinRequestDialogOpen}
          conversationId={conversation.id}
        />
      )}
    </>
  )
}
