import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { getJoinPreviewApi, joinByLinkApi } from '../api/chat.api'
import { chatKeys } from '../queries/keys'
import type { ConversationResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'
import { BaseDialog } from '@/components/common/base-dialog'
import { LinkIcon, AlertCircle, Loader2 } from 'lucide-react'
import { GroupAvatar } from './group/group-avatar'
import { UserAvatar } from '@/components/common/user-avatar'

interface JoinGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string | null
}

export function JoinGroupDialog({ open, onOpenChange, token }: JoinGroupDialogProps) {
  const { t } = useChatText()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: preview,
    isLoading,
    error
  } = useQuery({
    queryKey: ['join-preview', token],
    queryFn: () => getJoinPreviewApi(token!),
    enabled: open && !!token,
    retry: false
  })

  const { mutate: joinGroup, isPending: isJoining } = useMutation({
    mutationFn: (t: string) => joinByLinkApi(t),
    onSuccess: (newConv: ConversationResponse) => {
      queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
        if (!oldData) return [newConv]
        const exists = oldData.some((conv) => conv.id === newConv.id)
        return exists ? oldData.map((conv) => (conv.id === newConv.id ? newConv : conv)) : [newConv, ...oldData]
      })
      onOpenChange(false)
      navigate(`/chat/c/${newConv.id}`)
    }
  })

  const handleJoin = () => {
    if (token) joinGroup(token)
  }

  const handleGoToChat = () => {
    if (preview?.conversationId) {
      onOpenChange(false)
      navigate(`/chat/c/${preview.conversationId}`)
    }
  }

  const errorCode = (error as { response?: { data?: { code?: number } } })?.response?.data?.code
  const isInvalid = errorCode === 4021
  const isDisabled = errorCode === 4020

  // Error state
  if (error && open) {
    return (
      <BaseDialog
        open={open}
        onOpenChange={onOpenChange}
        title={t('chat.join-group-dialog.title')}
        cancelText={t('chat.join-group-dialog.close')}
      >
        <div className='flex flex-col items-center gap-3 py-4'>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10'>
            {isInvalid ? (
              <LinkIcon className='h-7 w-7 text-destructive' />
            ) : (
              <AlertCircle className='h-7 w-7 text-destructive' />
            )}
          </div>
          <p className='text-sm font-semibold'>
            {isInvalid
              ? t('chat.join-group-dialog.link_invalid')
              : isDisabled
                ? t('chat.join-group-dialog.link_disabled')
                : t('chat.join-group-dialog.error')}
          </p>
          <p className='text-xs text-muted-foreground text-center max-w-[280px]'>
            {isInvalid
              ? t('chat.join-group-dialog.link_invalid_desc')
              : isDisabled
                ? t('chat.join-group-dialog.link_disabled_desc')
                : t('chat.join-group-dialog.error_desc')}
          </p>
        </div>
      </BaseDialog>
    )
  }

  // Loading state
  if (isLoading || !preview) {
    return (
      <BaseDialog open={open} onOpenChange={onOpenChange} title={t('chat.join-group-dialog.title')}>
        <div className='flex items-center justify-center py-10'>
          <Loader2 className='h-7 w-7 animate-spin text-muted-foreground' />
        </div>
      </BaseDialog>
    )
  }

  // Already a member
  if (preview.isAlreadyMember) {
    return (
      <BaseDialog
        open={open}
        onOpenChange={onOpenChange}
        title={t('chat.join-group-dialog.title')}
        cancelText={t('chat.join-group-dialog.close')}
        confirmText={t('chat.join-group-dialog.go_to_chat')}
        onConfirm={handleGoToChat}
      >
        <div className='flex flex-col items-center gap-4 py-2 mt-2'>
          <GroupAvatar
            avatars={preview.memberPreviews.map((m) => m.avatar)}
            names={preview.memberPreviews.map((m) => m.name)}
            count={preview.memberCount}
            size='xl'
          />
          <div className='text-center space-y-1'>
            <p className='text-[18px] font-bold text-foreground leading-tight'>
              {preview.groupName || t('chat.join-link-card.default_name')}
            </p>
            <p className='text-[13px] text-primary font-medium'>
              {preview.createdByName
                ? t('chat.join-group-dialog.members_and_creator', {
                    count: preview.memberCount,
                    creator: preview.createdByName
                  })
                : t('chat.join-group-dialog.members_only', { count: preview.memberCount })}
            </p>
          </div>
        </div>
      </BaseDialog>
    )
  }

  // Not a member - show join UI
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('chat.join-group-dialog.title')}
      cancelText={t('chat.join-group-dialog.close')}
      confirmText={isJoining ? t('chat.join-group-dialog.joining') : t('chat.join-group-dialog.join')}
      onConfirm={handleJoin}
      isPending={isJoining}
    >
      <div className='flex flex-col items-center gap-3 py-2 mt-2'>
        <GroupAvatar
          avatars={preview.memberPreviews.map((m) => m.avatar)}
          names={preview.memberPreviews.map((m) => m.name)}
          count={preview.memberCount}
          size='xl'
        />
        <div className='text-center space-y-1 mb-2'>
          <p className='text-[18px] font-bold text-foreground leading-tight'>
            {preview.groupName || t('chat.join-link-card.default_name')}
          </p>
          <p className='text-[13px] text-muted-foreground/80 font-medium'>
            {preview.createdByName
              ? t('chat.join-group-dialog.members_and_creator', {
                  count: preview.memberCount,
                  creator: preview.createdByName
                })
              : t('chat.join-group-dialog.members_only', { count: preview.memberCount })}
          </p>
        </div>

        <div className='w-full h-px bg-border/60 my-2' />
        <p className='text-[14.5px] text-foreground font-semibold text-center px-8 leading-relaxed mb-1'>
          {t('chat.join-group-dialog.waiting_room')}
        </p>

        {preview.memberPreviews.length > 0 && (
          <div className='flex -space-x-2 mt-1'>
            {preview.memberPreviews.slice(0, 5).map((member, idx) => (
              <UserAvatar
                key={idx}
                name={member.name}
                src={member.avatar}
                className='h-8! w-8! border-2 border-background'
              />
            ))}
            {preview.memberCount > 5 && (
              <div className='h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground'>
                +{preview.memberCount - 5}
              </div>
            )}
          </div>
        )}
      </div>
    </BaseDialog>
  )
}
