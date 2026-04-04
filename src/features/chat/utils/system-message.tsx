import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Trans } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useAuth } from '../../auth/hooks/use-auth'
import { useChatText } from '../i18n/use-chat-text'
import type { ConversationMemberResponse, MessageResponse, ConversationResponse } from '../schemas/chat.schema'
import { GroupAvatar } from '../components/group-avatar'

export type SystemMessageAction = 'ADD_MEMBERS' | 'REMOVE_MEMBER' | 'LEAVE_GROUP' | 'UPDATE_NAME' | 'UPDATE_AVATAR'

export interface SystemMetadata {
  action: SystemMessageAction
  actorId?: string
  targetIds?: string[]
  oldValue?: string
  newValue?: string
}

export function getSystemMessageLabel(
  metadata: Record<string, unknown> | null | undefined,
  currentUserId: string | null | undefined,
  members: ConversationMemberResponse[] | null | undefined,
  t: TFunction<'chat'>,
  isRich: boolean = false
): string | ReactNode {
  if (!metadata) return ''

  const { action, actorId, targetIds } = metadata as unknown as SystemMetadata
  const memberMap = new Map(members?.map((m) => [m.userId, m.fullName]))

  const getActorName = () => (actorId === currentUserId ? t('chat.you') : memberMap.get(actorId || '') || actorId || '')

  if (action === 'ADD_MEMBERS') {
    if (!targetIds || targetIds.length === 0) return ''

    const actor = getActorName()
    const isMeInTargets = targetIds.includes(currentUserId || '')

    let i18nKey = ''
    let values: Record<string, unknown> = { actor }

    if (!isRich) {
      if (actorId === currentUserId) {
        return t('chat.system.add_members.group_created')
      }
      if (isMeInTargets) {
        return t('chat.system.add_members.joined_group')
      }
    }

    if (isMeInTargets) {
      if (targetIds.length === 1) {
        i18nKey = 'chat.system.add_members.single_self'
      } else {
        const others = targetIds.filter((id) => id !== currentUserId)
        if (targetIds.length <= 4) {
          const names = others.map((id) => memberMap.get(id) || id).join(', ')
          i18nKey = 'chat.system.add_members.many_self'
          values = { ...values, targets: names }
        } else {
          const firstOther = memberMap.get(others[0]) || others[0]
          i18nKey = 'chat.system.add_members.many_self_count'
          values = { ...values, targets: firstOther, count: targetIds.length - 2 }
        }
      }
    } else {
      if (targetIds.length === 1) {
        const firstTarget = memberMap.get(targetIds[0]) || targetIds[0]
        i18nKey = 'chat.system.add_members.single_other'
        values = { ...values, target: firstTarget }
      } else if (targetIds.length <= 4) {
        const names = targetIds.map((id) => memberMap.get(id) || id).join(', ')
        i18nKey = 'chat.system.add_members.many_other'
        values = { ...values, targets: names }
      } else {
        const firstTwo = targetIds
          .slice(0, 2)
          .map((id) => memberMap.get(id) || id)
          .join(', ')
        i18nKey = 'chat.system.add_members.many_other_count'
        values = { ...values, targets: firstTwo, count: targetIds.length - 2 }
      }
    }

    if (isRich) {
      return (
        <Trans
          ns='chat'
          i18nKey={i18nKey}
          values={values}
          components={{
            bold: <strong className='font-semibold' />,
            actorBold: actorId === currentUserId ? <span /> : <strong className='font-semibold' />
          }}
        />
      )
    }

    // For sidebar preview: plain text without bold tags
    const plainText = t(i18nKey, { ns: 'chat', ...values }) as string
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
    <div className='flex justify-center w-full my-4 px-4'>
      <div className='system-msg flex items-center gap-2 pr-4 pl-1'>
        {targetAvatars.length > 0 && (
          <GroupAvatar
            avatars={targetAvatars.map((a) => a.avatar)}
            names={targetAvatars.map((a) => a.name)}
            count={targetAvatars.length}
            size='sm'
            className='shrink-0 w-8! h-8!'
          />
        )}
        <div className='flex-1 text-[12px]'>{systemLabel}</div>
      </div>
    </div>
  )
}
