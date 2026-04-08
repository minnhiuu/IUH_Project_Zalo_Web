import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '../../auth/hooks/use-auth'
import { useChatText } from '../i18n/use-chat-text'
import type { MessageResponse, ConversationResponse } from '../schemas/chat.schema'
import { MemberAvatar } from '../components/group/member-avatar'
import { useDeleteConversationMutation } from '../queries/use-mutations'
import { OthersProfileDialog } from '@/features/user'
import { getSystemMessageLabel, type SystemMetadata } from './system-message-label'
import { GroupIntroCard } from '../components/group/group-intro-card'
import { getConversationDisplayName } from './group-name'

export { getSystemMessageLabel } from './system-message-label'
export type { SystemActionType, SystemMetadata } from './system-message-label'

export interface SystemMessageProps {
  message: MessageResponse
  conversation?: ConversationResponse
}

export function SystemMessage({ message, conversation }: SystemMessageProps) {
  const { user } = useAuth()
  const { t } = useChatText()
  const { mutate: deleteConversation } = useDeleteConversationMutation()
  const [profileUserId, setProfileUserId] = useState<string | undefined>(undefined)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

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
    if ((metadata?.action === 'ADD_MEMBERS' || metadata?.action === 'CREATE_GROUP') && metadata.targetIds) {
      avatars = metadata.targetIds.map((id) => {
        const member = conversation?.members?.find((m) => m.userId === id)
        return { id, avatar: member?.avatar, name: member?.fullName || t('chat.user') }
      })
    } else if (metadata?.action === 'LEAVE_GROUP' && message.senderId) {
      avatars = [{ id: message.senderId, avatar: message.senderAvatar, name: message.senderName || t('chat.user') }]
    } else if (metadata?.action === 'REMOVE_MEMBER' && metadata.targetIds) {
      avatars = metadata.targetIds.map((id) => {
        const member = conversation?.members?.find((m) => m.userId === id)
        return { id, avatar: member?.avatar, name: member?.fullName || t('chat.user') }
      })
    }

    return { systemLabel: label, targetAvatars: avatars }
  }, [message, conversation, user?.id, t, handleOpenProfile])

  if (!systemLabel) return null
  const metadata = message.metadata as unknown as SystemMetadata | undefined

  if (metadata?.action === 'CREATE_GROUP') {
    const groupTitle = conversation
      ? getConversationDisplayName(conversation, t('chat.user'), undefined, user?.id)
      : t('chat.user')
    const groupMembers = (conversation?.members || []).map((m) => ({
      id: m.userId,
      avatar: m.avatar,
      name: m.fullName || t('chat.user')
    }))
    return (
      <>
        <GroupIntroCard
          conversationId={conversation?.id}
          groupTitle={groupTitle}
          groupMembers={groupMembers}
          targetAvatars={[]}
          secondaryLabel={systemLabel}
          t={t}
        />
        <OthersProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} userId={profileUserId} />
      </>
    )
  }

  if (metadata?.action === 'ADD_MEMBERS') {
    const isActor = String(message.senderId || '') === String(user?.id || '')
    if (isActor) return null

    const isTarget = (metadata.targetIds || []).map(String).includes(String(user?.id || ''))
    if (isTarget) {
      const groupTitle = conversation
        ? getConversationDisplayName(conversation, t('chat.user'), undefined, user?.id)
        : t('chat.user')
      const groupMembers = (conversation?.members || []).map((m) => ({
        id: m.userId,
        avatar: m.avatar,
        name: m.fullName || t('chat.user')
      }))
      return (
        <>
          <GroupIntroCard
            conversationId={conversation?.id}
            groupTitle={groupTitle}
            groupMembers={groupMembers}
            targetAvatars={targetAvatars}
            secondaryLabel={systemLabel}
            t={t}
          />
          <OthersProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} userId={profileUserId} />
        </>
      )
    }
    // Existing members: fall through to normal pill render
  }

  const isDisbanded = metadata?.action === 'DISBAND_GROUP'
  const isCurrentUserRemoved =
    metadata?.action === 'REMOVE_MEMBER' && (metadata.targetIds || []).map(String).includes(String(user?.id || ''))
  const isCurrentUserLeftGroup =
    metadata?.action === 'LEAVE_GROUP' && String(message.senderId || '') === String(user?.id || '')
  const showDeleteConversationAction = isDisbanded || isCurrentUserRemoved || isCurrentUserLeftGroup

  return (
    <>
      <div className='flex justify-center w-full my-2.5 px-4'>
        <div className='system-msg flex items-center gap-2.5 py-1.5 px-3.5 max-w-[95%]'>
          {targetAvatars.length > 0 && <MemberAvatar members={targetAvatars} size='xs' className='shrink-0' />}
          <div className='flex-1 text-[12.5px] leading-relaxed text-left flex items-center gap-1.5'>
            {systemLabel}
            {showDeleteConversationAction && (
              <button
                onClick={() => {
                  if (conversation?.id) {
                    deleteConversation(conversation.id)
                  }
                }}
                className='text-blue-500 hover:text-blue-600 font-medium whitespace-nowrap'
              >
                {t('chat.disbanded.deleteAction')}
              </button>
            )}
          </div>
        </div>
      </div>

      <OthersProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} userId={profileUserId} />
    </>
  )
}
