import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { chatKeys } from '../../../queries/keys'
import { useJoinPreviewQuery } from '../../../queries/use-queries'
import { useJoinByLinkMutation, useCancelJoinRequestMutation } from '../../../queries/use-mutations'
import type { ConversationResponse } from '../../../schemas/chat.schema'
import { useChatText } from '../../../i18n/use-chat-text'
import { BaseDialog } from '@/components/common/base-dialog'
import { LinkIcon, AlertCircle, Loader2, Clock } from 'lucide-react'
import { GroupAvatar } from '../group-avatar'
import { UserAvatar } from '@/components/common/user-avatar'
import { showWarningToast } from '@/utils/toast'

interface JoinGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string | null
}

export function JoinGroupDialog({ open, onOpenChange, token }: JoinGroupDialogProps) {
  const { text: tg } = useChatText()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: preview,
    isLoading,
    error
  } = useJoinPreviewQuery(token!, open && !!token)

  const { mutate: joinGroup, isPending: isJoining } = useJoinByLinkMutation()
  const { mutate: cancelRequest, isPending: isCanceling } = useCancelJoinRequestMutation()

  const handleAction = () => {
    if (preview?.hasPendingRequest) {
      cancelRequest(preview.conversationId!, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: chatKeys.joinPreview(token) })
        }
      })
    } else if (token) {
      joinGroup(token, {
        onSuccess: (newConv) => {
          if (newConv) {
            onOpenChange(false)
            navigate(`/chat/c/${newConv.id}`)
          } else {
            // Approval required — request was created
            showWarningToast(text.request_pending_toast)
            queryClient.invalidateQueries({ queryKey: chatKeys.joinPreview(token) })
          }
        }
      })
    }
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

  const text = tg['join-group-dialog']

  // Error state
  if (error && open) {
    return (
      <BaseDialog open={open} onOpenChange={onOpenChange} title={text.title} cancelText={text.close}>
        <div className='flex flex-col items-center gap-3 py-4'>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10'>
            {isInvalid ? (
              <LinkIcon className='h-7 w-7 text-destructive' />
            ) : (
              <AlertCircle className='h-7 w-7 text-destructive' />
            )}
          </div>
          <p className='text-sm font-semibold'>
            {isInvalid ? text.link_invalid : isDisabled ? text.link_disabled : text.error}
          </p>
          <p className='text-xs text-muted-foreground text-center max-w-[280px]'>
            {isInvalid ? text.link_invalid_desc : isDisabled ? text.link_disabled_desc : text.error_desc}
          </p>
        </div>
      </BaseDialog>
    )
  }

  // Loading state
  if (isLoading || !preview) {
    return (
      <BaseDialog open={open} onOpenChange={onOpenChange} title={text.title}>
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
        title={text.title}
        cancelText={text.close}
        confirmText={text.go_to_chat}
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
              {preview.groupName || text.default_name}
            </p>
            <p className='text-[13px] text-primary font-medium'>
              {preview.createdByName
                ? text.members_and_creator(preview.memberCount, preview.createdByName)
                : text.members_only(preview.memberCount)}
            </p>
          </div>
        </div>
      </BaseDialog>
    )
  }

  if (preview.hasPendingRequest) {
    return (
      <BaseDialog
        open={open}
        onOpenChange={onOpenChange}
        title={text.title}
        cancelText={text.close}
        confirmText={isCanceling ? text.canceling : text.cancel_request}
        onConfirm={handleAction}
        isPending={isCanceling}
        variant='danger'
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
              {preview.groupName || text.default_name}
            </p>
            <p className='text-[13px] text-muted-foreground/80 font-medium'>
              {preview.createdByName
                ? text.members_and_creator(preview.memberCount, preview.createdByName)
                : text.members_only(preview.memberCount)}
            </p>
          </div>

          <div className='w-full h-px bg-border/60 my-2' />
          <div className='flex items-center gap-2 text-primary font-semibold'>
            <Clock className='h-5 w-5' />
            <p className='text-[14px]'>{text.request_pending_dialog}</p>
          </div>
          <p className='text-[13.5px] text-muted-foreground text-center px-6 leading-relaxed'>
            {text.request_pending_desc}
          </p>
        </div>
      </BaseDialog>
    )
  }

  // Not a member - show join UI
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={text.title}
      cancelText={text.close}
      confirmText={isJoining ? text.joining : text.join}
      onConfirm={handleAction}
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
            {preview.groupName || text.default_name}
          </p>
          <p className='text-[13px] text-muted-foreground/80 font-medium'>
            {preview.createdByName
              ? text.members_and_creator(preview.memberCount, preview.createdByName)
              : text.members_only(preview.memberCount)}
          </p>
        </div>

        <div className='w-full h-px bg-border/60 my-2' />
        <p className='text-[14px] text-foreground font-medium text-center px-8 leading-relaxed mb-1'>
          {text.waiting_room}
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
