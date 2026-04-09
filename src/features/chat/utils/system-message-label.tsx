import type { ReactNode } from 'react'
import { Trans } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Pencil } from 'lucide-react'
import type { SystemActionType as ChatSystemActionType } from '@/constants/enum'
export type { SystemActionType } from '@/constants/enum'
import type { ConversationMemberResponse } from '../schemas/chat.schema'
import { resolveSystemAction } from '../components/system-message/resolve-system-action'

export interface SystemMetadata {
  action: ChatSystemActionType
  targetIds?: string[]
  payload?: Record<string, unknown>
}

export function getSystemMessageLabel(
  metadataRaw: unknown,
  senderId: string | undefined,
  senderName: string | undefined,
  currentUserId: string | undefined,
  members: ConversationMemberResponse[],
  translate: TFunction<'chat'>,
  isMainChat: boolean = false,
  onUserClick?: (userId: string) => void
): string | ReactNode {
  const metadata = metadataRaw as SystemMetadata | null | undefined
  if (!metadata) return ''

  const { action, targetIds } = metadata
  const normalizedTargetIds = (targetIds || []).map((id) => String(id))
  const memberNameById = new Map(members.map((m) => [String(m.userId), m.fullName]))
  const payloadTargetNames = Array.isArray(metadata.payload?.targetNames)
    ? metadata.payload.targetNames.map(String)
    : []
  const payloadSingleTargetName =
    typeof metadata.payload?.targetName === 'string' ? String(metadata.payload.targetName) : undefined
  const targetNameById = new Map<string, string>()
  normalizedTargetIds.forEach((id, index) => {
    const payloadName = payloadTargetNames[index]
    if (payloadName) {
      targetNameById.set(id, payloadName)
    }
  })
  if (payloadSingleTargetName && normalizedTargetIds[0] && !targetNameById.has(normalizedTargetIds[0])) {
    targetNameById.set(normalizedTargetIds[0], payloadSingleTargetName)
  }
  const normalizedCurrentUserId = String(currentUserId || '')
  const actorNameFromMembers = memberNameById.get(String(senderId))
  const isActorMe = currentUserId && String(senderId) === String(currentUserId)

  const fallbackUserLabel = String(translate('chat.user'))
  const actorNameLower = isActorMe
    ? String(translate('chat.you_lower'))
    : actorNameFromMembers || senderName || fallbackUserLabel
  const actorNameCapital = isActorMe
    ? String(translate('chat.you'))
    : actorNameFromMembers || senderName || fallbackUserLabel

  const resolved = resolveSystemAction({
    metadata,
    senderId,
    currentUserId,
    members,
    translate,
    actorNameLower,
    actorNameCapital,
    normalizedTargetIds,
    normalizedCurrentUserId
  })

  if (resolved.directLabel !== undefined) {
    return resolved.directLabel
  }

  const i18nKey = resolved.i18nKey || ''
  const values: Record<string, string | number> = {
    actor: actorNameLower,
    ...(resolved.values || {})
  }
  const clickableTargetIds = resolved.clickableTargetIds || []

  if (i18nKey) {
    if (isMainChat) {
      const ClickableTargets = ({ children }: { children?: ReactNode }) => {
        if (!clickableTargetIds.length || !onUserClick) {
          return <strong className='font-semibold'>{children}</strong>
        }

        const targetUsers = clickableTargetIds
          .map((id) => ({
            id,
            name: memberNameById.get(String(id)) || targetNameById.get(id) || fallbackUserLabel
          }))
          .filter((u) => u.id !== currentUserId)

        if (!targetUsers.length) {
          return <strong className='font-semibold'>{children}</strong>
        }

        return (
          <strong className='font-semibold'>
            {targetUsers.map((u, index) => (
              <span key={u.id}>
                <button
                  type='button'
                  className='cursor-pointer pointer-events-auto transition-colors hover:text-foreground'
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => onUserClick(u.id)}
                >
                  {u.name}
                </button>
                {index < targetUsers.length - 1 ? ', ' : ''}
              </span>
            ))}
          </strong>
        )
      }

      const ClickableActor = ({ children }: { children?: ReactNode }) => {
        if (!onUserClick || !senderId || String(senderId) === String(currentUserId)) {
          return <strong className='font-semibold'>{children}</strong>
        }

        return (
          <strong className='font-semibold'>
            <button
              type='button'
              className='cursor-pointer pointer-events-auto transition-colors hover:text-foreground'
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => onUserClick(senderId)}
            >
              {children}
            </button>
          </strong>
        )
      }

      return (
        <span className='inline text-left'>
          {action === 'UPDATE_NAME' && (
            <Pencil className='inline-block w-3 h-3 mb-0.5 mr-1 text-green-500 cursor-pointer' />
          )}
          <Trans
            ns='chat'
            i18nKey={i18nKey}
            values={values}
            components={{
              bold: <ClickableTargets />,
              actorBold: <ClickableActor />
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
