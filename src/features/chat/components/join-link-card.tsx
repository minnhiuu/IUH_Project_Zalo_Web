import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { chatOptions } from '../queries/options'
import { joinByLinkApi } from '../api/chat.api'
import { Users } from 'lucide-react'
import { JoinGroupDialog } from './group/dialogs/join-group-dialog'
import { useChatText } from '../i18n/use-chat-text'
import { GroupAvatar } from '@/components/common/group-avatar'
import { showSimpleToast } from '@/utils/toast'
import { extractGroupLinkToken } from '../utils/group-link'

interface LinkPreviewData {
  url: string
  token: string
  groupName?: string | null
  groupAvatar?: string | null
  memberCount: number
  memberPreviews: { name: string; avatar?: string | null }[]
}

interface JoinLinkCardProps {
  token: string
  url: string
  cachedPreview?: LinkPreviewData
}

export function JoinLinkCard({ token, url, cachedPreview }: JoinLinkCardProps) {
  const { t } = useChatText()
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const preview = cachedPreview ?? null

  const domain = (() => {
    try {
      return new URL(url).hostname
    } catch {
      return ''
    }
  })()

  const queryClient = useQueryClient()

  const resolvedToken = token || extractGroupLinkToken(url)

  const handleClick = useCallback(async () => {
    if (isChecking) return
    if (!resolvedToken) {
      showSimpleToast(t('chat.join-link-card.link_not_exist'), 2000)
      return
    }
    setIsChecking(true)
    try {
      const freshPreview = await queryClient.fetchQuery(chatOptions.joinPreview(resolvedToken))

      if (freshPreview.isAlreadyMember && freshPreview.conversationId) {
        navigate(`/chat/c/${freshPreview.conversationId}`)
      } else if (!freshPreview.membershipApprovalEnabled && !freshPreview.hasPendingRequest) {
        const joinedConversation = await joinByLinkApi(resolvedToken)
        if (joinedConversation?.id) {
          navigate(`/chat/c/${joinedConversation.id}`)
        } else {
          setDialogOpen(true)
        }
      } else {
        setDialogOpen(true)
      }
    } catch {
      showSimpleToast(t('chat.join-link-card.link_not_exist'), 2000)
    } finally {
      setIsChecking(false)
    }
  }, [resolvedToken, navigate, t, isChecking, queryClient])

  return (
    <>
      <div className='cursor-pointer select-none' onClick={handleClick}>
        {/* URL text */}
        <p className='text-[13px] text-[var(--text-information)] underline mb-2 break-all'>{url}</p>

        {/* Rich card */}
        <div className='rounded-xl border border-[var(--border)] overflow-hidden w-[330px] max-w-full shadow-sm bg-card'>
          {preview ? (
            <>
              {/* Main card body */}
              <div className='flex items-center gap-4 p-4 bg-[var(--brand-blue-light)]'>
                <GroupAvatar
                  avatars={preview.memberPreviews.map((m) => m.avatar)}
                  names={preview.memberPreviews.map((m) => m.name)}
                  count={preview.memberCount}
                  size='lg'
                  className='shrink-0'
                />
                <div className='min-w-0 flex-1'>
                  <p className='text-[12px] text-[var(--brand-blue-text)] font-medium'>
                    {t('chat.join-link-card.group_label')}
                  </p>
                  <p className='text-[15px] font-bold text-[var(--foreground)] truncate leading-snug mt-0.5'>
                    {preview.groupName || t('chat.join-link-card.default_name')}
                  </p>
                  <p className='text-[12px] text-[var(--text-secondary)] mt-0.5'>
                    {t('chat.join-link-card.member_count', { count: preview.memberCount })}
                  </p>
                </div>
              </div>
              {/* Footer */}
              <div className='border-t border-[var(--border)] px-4 py-2.5 flex items-center justify-between bg-[var(--card)]'>
                <span className='text-[12px] text-[var(--text-information)] font-semibold'>
                  {t('chat.join-link-card.click_to_join')}
                </span>
                {domain && <span className='text-[11px] text-[var(--text-secondary)]'>{domain}</span>}
              </div>
            </>
          ) : (
            <div className='flex items-center gap-3 p-4 bg-[var(--card)]'>
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)]'>
                <Users className='h-7 w-7 text-[var(--muted-foreground)]' />
              </div>
              <div className='min-w-0'>
                <p className='text-sm font-medium text-[var(--foreground)]'>{t('chat.join-link-card.group_label')}</p>
                <p className='text-xs text-[var(--muted-foreground)]'>{t('chat.join-link-card.click_to_join')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <JoinGroupDialog open={dialogOpen} onOpenChange={setDialogOpen} token={resolvedToken} />
    </>
  )
}
