import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { getJoinPreviewApi } from '../api/chat.api'
import { Users, Loader2 } from 'lucide-react'
import { JoinGroupDialog } from './join-group-dialog'
import { useChatText } from '../i18n/use-chat-text'
import { GroupAvatar } from './group/group-avatar'

interface JoinLinkCardProps {
  token: string
  url: string
}

export function JoinLinkCard({ token, url }: JoinLinkCardProps) {
  const { t } = useChatText()
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)

  const {
    data: preview,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['join-preview', token],
    queryFn: () => getJoinPreviewApi(token),
    retry: false,
    staleTime: 5 * 60 * 1000
  })

  const domain = (() => {
    try {
      return new URL(url).hostname
    } catch {
      return ''
    }
  })()

  const handleClick = () => {
    if (preview?.isAlreadyMember && preview.conversationId) {
      navigate(`/chat/c/${preview.conversationId}`)
    } else {
      setDialogOpen(true)
    }
  }

  return (
    <>
      <div className='cursor-pointer select-none' onClick={handleClick}>
        {/* URL text */}
        <p className='text-[13px] text-[var(--text-information)] underline mb-2 break-all'>{url}</p>

        {/* Rich card */}
        <div className='rounded-xl border border-[var(--border)] overflow-hidden w-[330px] max-w-full shadow-sm bg-card'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8 bg-[var(--card)]'>
              <Loader2 className='h-6 w-6 animate-spin text-[var(--muted-foreground)]' />
            </div>
          ) : isError ? (
            <div className='flex items-center gap-3 p-4 bg-[var(--card)]'>
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)]'>
                <Users className='h-7 w-7 text-[var(--muted-foreground)]' />
              </div>
              <div className='min-w-0'>
                <p className='text-sm font-medium text-[var(--muted-foreground)]'>
                  {t('chat.join-link-card.unavailable')}
                </p>
              </div>
            </div>
          ) : preview ? (
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
          ) : null}
        </div>
      </div>

      <JoinGroupDialog open={dialogOpen} onOpenChange={setDialogOpen} token={token} />
    </>
  )
}
