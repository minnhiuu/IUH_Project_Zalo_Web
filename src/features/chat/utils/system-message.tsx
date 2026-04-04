import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Trans } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useAuth } from '../../auth/hooks/use-auth'
import { useChatText } from '../i18n/use-chat-text'
import type { ConversationMemberResponse, MessageResponse, ConversationResponse } from '../schemas/chat.schema'
import { GroupAvatar } from '../components/group-avatar'
import { Pencil } from 'lucide-react'

export type SystemActionType = 'ADD_MEMBERS' | 'REMOVE_MEMBER' | 'LEAVE_GROUP' | 'UPDATE_NAME' | 'UPDATE_AVATAR'

export interface SystemMetadata {
  action: SystemActionType
  actorId: string
  actorName?: string
  targetIds?: string[]
  payload?: Record<string, string | number>
}

export function getSystemMessageLabel(
  metadataRaw: unknown,
  currentUserId: string | undefined,
  members: ConversationMemberResponse[],
  translate: TFunction<'chat'>,
  isMainChat: boolean = false
): string | ReactNode {
  const metadata = metadataRaw as SystemMetadata | null | undefined
  if (!metadata) return ''

  const { action, actorId, actorName: actorNameMeta, targetIds, payload } = metadata
  const actor = members.find((m) => String(m.userId) === String(actorId))
  const isActorMe = currentUserId && String(actorId) === String(currentUserId)

  const actorNameLower = isActorMe ? String(translate('chat.you_lower')) : actor?.fullName || actorNameMeta || 'User'
  const actorNameCapital = isActorMe ? String(translate('chat.you')) : actor?.fullName || actorNameMeta || 'User'

  let i18nKey = ''
  const values: Record<string, string | number> = { actor: actorNameLower }

  if (action === 'ADD_MEMBERS') {
    if (!targetIds || targetIds.length === 0) {
      if (actorId === currentUserId) return translate('chat.system.add_members.group_created')
      return translate('chat.system.add_members.joined_group')
    }

    const isSelfAdded = targetIds.includes(currentUserId || '')

    if (isSelfAdded) {
      if (targetIds.length === 1) {
        i18nKey = 'chat.system.add_members.single_self'
      } else {
        const otherTargets = targetIds.filter((id) => id !== currentUserId)
        const firstTargetId = otherTargets[0]
        const firstTarget = members.find((m) => m.userId === firstTargetId)
        const firstTargetName = firstTarget?.fullName || 'User'

        if (targetIds.length === 2) {
          i18nKey = 'chat.system.add_members.many_self'
          values.targets = firstTargetName
        } else {
          i18nKey = 'chat.system.add_members.many_self_count'
          values.targets = firstTargetName
          values.count = targetIds.length - 2
        }
      }
    } else {
      const firstTargetId = targetIds[0]
      const firstTarget = members.find((m) => m.userId === firstTargetId)
      const firstTargetName = firstTarget?.fullName || 'User'

      if (targetIds.length === 1) {
        i18nKey = 'chat.system.add_members.single_other'
        values.target = firstTargetName
      } else if (targetIds.length <= 2) {
        i18nKey = 'chat.system.add_members.many_other'
        values.targets = targetIds.map((id) => members.find((m) => m.userId === id)?.fullName || 'User').join(', ')
      } else {
        i18nKey = 'chat.system.add_members.many_other_count'
        values.targets = firstTargetName
        values.count = targetIds.length - 1
      }
    }
  } else if (action === 'UPDATE_NAME') {
    i18nKey = 'chat.system.add_members.update_name'
    values.actor = actorNameCapital // Viết hoa vì đứng đầu câu
    values.oldName = String(payload?.oldName || '')
    values.newName = String(payload?.newName || '')
  } else if (action === 'UPDATE_AVATAR') {
    i18nKey = 'chat.system.add_members.update_avatar'
    values.actor = actorNameCapital // Viết hoa vì đứng đầu câu
  }

  if (i18nKey) {
    if (isMainChat) {
      return (
        <span className='inline text-left'>
          {action === 'UPDATE_NAME' && (
            <Pencil className='inline-block w-3 h-3 mb-0.5 mr-1 text-brand-teal cursor-pointer' />
          )}
          <Trans
            ns='chat'
            i18nKey={i18nKey}
            values={values}
            components={{
              bold: <strong className='font-semibold' />,
              actorBold: actorId === currentUserId ? <span /> : <strong className='font-semibold' />
            }}
          />
        </span>
      )
    }

    const plainText = translate(i18nKey, { ns: 'chat', ...values }) as string
    return plainText.replace(/<[^>]*>/g, '')
  }

  return ''
}

export interface SystemMessageProps {
  message: MessageResponse
  conversation?: ConversationResponse
}

export function SystemMessage({ message, conversation }: SystemMessageProps) {
  const { user } = useAuth()
  const { t } = useChatText()

  const { systemLabel, targetAvatars } = useMemo(() => {
    const metadata = message.metadata as unknown as SystemMetadata | null | undefined
    const label = getSystemMessageLabel(message.metadata, user?.id, conversation?.members || [], t, true)

    let avatars: { id: string; avatar?: string | null; name: string }[] = []
    if (metadata?.action === 'ADD_MEMBERS' && metadata.targetIds) {
      avatars = metadata.targetIds.map((id) => {
        const member = conversation?.members?.find((m) => m.userId === id)
        return { id, avatar: member?.avatar, name: member?.fullName || 'User' }
      })
    }

    return { systemLabel: label, targetAvatars: avatars }
  }, [message.metadata, user?.id, conversation?.members, t])

  if (!systemLabel) return null

  return (
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
        <div className='flex-1 text-[12.5px] leading-relaxed text-left'>
          {systemLabel}
        </div>
      </div>
    </div>
  )
}
