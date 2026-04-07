import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '../../auth/hooks/use-auth'
import { useChatText } from '../i18n/use-chat-text'
import type { MessageResponse, ConversationResponse } from '../schemas/chat.schema'
import { GroupAvatar } from '../components/group/group-avatar'
import { useDeleteConversationMutation } from '../queries/use-mutations'
import { OthersProfileDialog } from '@/features/user'
import { CreateGroupSystemContent } from '../components/system-message/system-message-actions/create-group-system-content'
import { getSystemMessageLabel, type SystemMetadata } from './system-message-label'

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

  const { systemLabel, createGroupAddLabel, targetAvatars, isCreateGroupEvent, groupTitle, groupMembers } =
    useMemo(() => {
      const metadata = message.metadata as unknown as SystemMetadata | null | undefined
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

      const createGroupSecondaryLabel =
        metadata?.action === 'CREATE_GROUP'
          ? getSystemMessageLabel(
              {
                action: 'ADD_MEMBERS',
                targetIds: metadata.targetIds,
                payload: metadata.payload
              },
              message.senderId === null ? undefined : message.senderId,
              message.senderName === null ? undefined : message.senderName,
              user?.id,
              conversation?.members || [],
              t,
              true,
              handleOpenProfile
            )
          : ''

      const groupMembersData =
        metadata?.action === 'CREATE_GROUP'
          ? (conversation?.members || []).map((member) => ({
              id: member.userId,
              avatar: member.avatar,
              name: member.fullName || t('chat.user')
            }))
          : []

      let avatars: { id: string; avatar?: string | null; name: string }[] = []
      if ((metadata?.action === 'ADD_MEMBERS' || metadata?.action === 'CREATE_GROUP') && metadata.targetIds) {
        avatars = metadata.targetIds.map((id) => {
          const member = conversation?.members?.find((m) => m.userId === id)
          return { id, avatar: member?.avatar, name: member?.fullName || t('chat.user') }
        })
      }

      return {
        systemLabel: label,
        createGroupAddLabel: createGroupSecondaryLabel,
        targetAvatars: avatars,
        isCreateGroupEvent: metadata?.action === 'CREATE_GROUP',
        groupTitle: conversation?.name || t('chat.user'),
        groupMembers: groupMembersData
      }
    }, [
      message.metadata,
      message.senderId,
      message.senderName,
      user?.id,
      conversation?.name,
      conversation?.members,
      t,
      handleOpenProfile
    ])

  if (!systemLabel) return null
  const metadata = message.metadata as unknown as SystemMetadata | undefined
  const isDisbanded = metadata?.action === 'DISBAND_GROUP'
  const isCurrentUserRemoved =
    metadata?.action === 'REMOVE_MEMBER' && (metadata.targetIds || []).map(String).includes(String(user?.id || ''))
  const showDeleteConversationAction = isDisbanded || isCurrentUserRemoved

  if (isCreateGroupEvent) {
    const secondaryLabel = createGroupAddLabel || systemLabel

    return (
      <CreateGroupSystemContent
        conversationId={conversation?.id}
        groupTitle={groupTitle}
        groupMembers={groupMembers}
        targetAvatars={targetAvatars}
        secondaryLabel={secondaryLabel}
        t={t}
      />
    )
  }

  return (
    <>
      <div className='flex justify-center w-full my-2.5 px-4'>
        <div className='system-msg flex items-center gap-2.5 py-1.5 px-3.5 max-w-[95%]'>
          {targetAvatars.length > 0 && (
            <GroupAvatar
              avatars={targetAvatars.map((a) => a.avatar)}
              names={targetAvatars.map((a) => a.name)}
              count={targetAvatars.length}
              size='xs'
              className='shrink-0'
            />
          )}
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
