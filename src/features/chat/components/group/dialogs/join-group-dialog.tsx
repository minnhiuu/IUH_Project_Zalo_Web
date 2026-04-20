import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { chatKeys } from '../../../queries/keys'
import { useJoinPreviewQuery } from '../../../queries/use-queries'
import { useJoinByLinkMutation, useCancelJoinRequestMutation } from '../../../queries/use-mutations'
import { useChatText } from '../../../i18n/use-chat-text'
import { BaseDialog } from '@/components/common/base-dialog'
import { LinkIcon, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { GroupAvatar } from '@/components/common/group-avatar'
import { UserAvatar } from '@/components/common/user-avatar'
import { showWarningToast, showSuccessToast } from '@/utils/toast'
import { CharacterCounterTextarea } from '@/components/ui/character-counter-textarea'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface JoinGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string | null
}

export function JoinGroupDialog({ open, onOpenChange, token }: JoinGroupDialogProps) {
  const { text: tg } = useChatText()
  const { t: tc } = useTranslation('common')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const text = tg['join-group-dialog']

  const { data: preview, isLoading, error } = useJoinPreviewQuery(token!, open && !!token)

  const { mutate: joinGroup, isPending: isJoining } = useJoinByLinkMutation()
  const { mutate: cancelRequest, isPending: isCanceling } = useCancelJoinRequestMutation()

  const [step, setStep] = useState<'info' | 'question'>('info')
  const [joinAnswer, setJoinAnswer] = useState('')

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('info')
        setJoinAnswer('')
      }, 300)
    }
  }, [open])

  const handleAction = () => {
    if (preview?.isBlockedFromGroup) {
      showWarningToast(text.blocked_from_group)
      return
    }

    const effectivePendingRequest = !!preview?.membershipApprovalEnabled && !!preview?.hasPendingRequest

    if (effectivePendingRequest) {
      cancelRequest(preview.conversationId!, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: chatKeys.joinPreview(token!) })
        },
        onError: () => {
          showWarningToast(text.error)
        }
      })
      return
    }

    if (step === 'info') {
      if (preview?.joinQuestion) {
        setStep('question')
      } else {
        submitJoinRequest()
      }
    } else {
      if (!joinAnswer.trim()) {
        showWarningToast(text.answer_required_toast)
        return
      }
      submitJoinRequest()
    }
  }

  const submitJoinRequest = () => {
    if (!token) return

    joinGroup(
      { token, joinAnswer: joinAnswer.trim() || undefined },
      {
        onSuccess: (newConv) => {
          if (newConv) {
            onOpenChange(false)
            navigate(`/chat/c/${newConv.id}`)
          } else {
            showSuccessToast(text.request_pending_toast)
            onOpenChange(false)
            queryClient.invalidateQueries({ queryKey: chatKeys.joinPreview(token!) })
          }
        },
        onError: () => {
          showWarningToast(text.error)
        }
      }
    )
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
  const canGoToChat = preview?.isAlreadyMember && !!preview?.conversationId

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.98
    })
  }

  // Error state
  if (error && open) {
    return (
      <BaseDialog open={open} onOpenChange={onOpenChange} title={text.title} cancelText={tc('close')}>
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

  // Loading state or before preview
  if (isLoading || !preview) {
    return (
      <BaseDialog open={open} onOpenChange={onOpenChange} title={text.title}>
        <div className='flex items-center justify-center py-10'>
          <Loader2 className='h-7 w-7 animate-spin text-muted-foreground' />
        </div>
      </BaseDialog>
    )
  }

  const isQuestionStep = step === 'question'

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isQuestionStep ? text.request_title : text.title}
      headerLeft={
        isQuestionStep ? (
          <button onClick={() => setStep('info')} className='p-1 hover:bg-muted rounded-full transition-colors mr-1'>
            <ArrowLeft className='w-5 h-5 text-muted-foreground' />
          </button>
        ) : undefined
      }
      cancelText={isQuestionStep ? undefined : text.close}
      confirmText={
        canGoToChat
          ? text.go_to_chat
          : (!!preview.membershipApprovalEnabled && !!preview.hasPendingRequest)
            ? isCanceling
              ? text.canceling
              : text.cancel_request
            : isJoining
              ? text.joining
              : isQuestionStep
                ? text.send_request
                : text.join
      }
      onConfirm={canGoToChat ? handleGoToChat : handleAction}
      isPending={isJoining || isCanceling}
      confirmDisabled={isQuestionStep && !joinAnswer.trim()}
      variant={(!!preview.membershipApprovalEnabled && !!preview.hasPendingRequest) ? 'danger' : 'primary'}
      className='overflow-hidden sm:max-w-[560px]'
    >
      <motion.div
        className='relative w-full overflow-hidden'
        animate={{ height: isQuestionStep ? 'auto' : 320 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <AnimatePresence initial={false} custom={isQuestionStep ? 1 : -1} mode='wait'>
          {!isQuestionStep ? (
            <motion.div
              key='info'
              custom={-1}
              variants={variants}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className='flex flex-col items-center py-5 px-8 outline-none'
            >
              {/* Group Avatar Section */}
              <div className='mb-5'>
                <GroupAvatar
                  avatars={preview.memberPreviews.map((m) => m.avatar)}
                  names={preview.memberPreviews.map((m) => m.name)}
                  count={preview.memberCount}
                  size='xl'
                  className='scale-[1.4] shadow-sm'
                />
              </div>

              {/* Group Info Section */}
              <div className='text-center space-y-1 mt-3'>
                <h3 className='text-[18px] font-bold text-foreground leading-tight line-clamp-2 overflow-hidden px-2'>
                  {preview.groupName || text.default_name}
                </h3>
                <p className='text-[13px] text-muted-foreground font-medium'>
                  {preview.createdByName
                    ? text.members_and_creator(preview.memberCount, preview.createdByName)
                    : text.members_only(preview.memberCount)}
                </p>
              </div>

              {/* Divider */}
              <div className='w-full h-px bg-border/60 my-5' />

              {/* Waiting Room Description */}
              <div className='text-center px-4 mb-4'>
                <p className='text-[13.5px] text-foreground leading-normal'>{text.waiting_room}</p>
              </div>

              {/* Sub Avatar Section */}
              <div className='flex justify-center mt-2'>
                {preview.isAlreadyMember ? (
                  <div className='bg-primary/10 px-4 py-1.5 rounded-full'>
                    <p className='text-[12.5px] text-primary font-bold'>{text.already_member}</p>
                  </div>
                ) : (
                  <div className='flex -space-x-2'>
                    {preview.memberPreviews.slice(0, 3).map((member, idx) => (
                      <UserAvatar
                        key={idx}
                        name={member.name}
                        src={member.avatar}
                        className='h-9 w-9 border-2 border-background shadow-sm'
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key='question'
              custom={1}
              variants={variants}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className='space-y-4 pt-2 pb-5 outline-none'
            >
              <div className='px-1 space-y-4'>
                <p className='text-[13.5px] text-muted-foreground leading-snug'>{text.approval_required_desc}</p>

                <div className='space-y-4'>
                  <div className='max-h-[100px] overflow-y-auto pr-1 scrollbar-thin'>
                    <p className='text-[15.5px] font-semibold text-foreground leading-relaxed break-words'>
                      {preview.joinQuestion}
                    </p>
                  </div>

                  <CharacterCounterTextarea
                    maxLength={100}
                    placeholder={text.answer_placeholder}
                    value={joinAnswer}
                    onChange={(e) => setJoinAnswer(e.target.value)}
                    className='min-h-[140px] text-[14.5px] bg-muted/20 border-border/80 focus-visible:border-foreground/30 focus-visible:ring-0 rounded-2xl transition-all shadow-inner p-4'
                    counterClassName='bottom-4 right-4 text-muted-foreground/60 font-medium'
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </BaseDialog>
  )
}
