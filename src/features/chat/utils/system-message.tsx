import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '../../auth/hooks/use-auth'
import { useChatText } from '../i18n/use-chat-text'
import type { MessageResponse, ConversationResponse } from '../schemas/chat.schema'
import { MemberAvatar } from '../components/group/member-avatar'
import { useDeleteConversationMutation } from '../queries/use-mutations'
import { OthersProfileDialog } from '@/features/user'
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
    } else if (metadata?.action === 'REMOVE_MEMBER' && metadata.targetIds) {
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

  if (!systemLabel) return null
  const metadata = message.metadata as unknown as SystemMetadata | undefined
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
