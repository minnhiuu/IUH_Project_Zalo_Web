import { ArrowLeft } from 'lucide-react'
import { BaseDialog } from '@/components/common/base-dialog'
import { useChatText } from '../../../i18n/use-chat-text'
import type { ConversationResponse } from '../../../schemas/chat.schema'
import { useState } from 'react'
import { GroupManagementStep } from '../steps/group-management-step'
import { GroupInfoOverviewStep } from '../steps/group-info-overview-step'
import { AnimatePresence, motion } from 'framer-motion'
import { LeaveGroupDialog } from './leave-group-dialog'

interface GroupInfoDialogProps {
  conversation: ConversationResponse
  currentUserId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRenameClick: () => void
  onAvatarClick: () => void
  initialStep?: 'info' | 'management'
}

export function GroupInfoDialog({
  conversation,
  currentUserId,
  open,
  onOpenChange,
  onRenameClick,
  onAvatarClick,
  initialStep = 'info'
}: GroupInfoDialogProps) {
  const { text } = useChatText()
  const tg = text['group-info-dialog']
  const [step, setStep] = useState<'info' | 'management'>(initialStep)
  const [isLeaveGroupDialogOpen, setIsLeaveGroupDialogOpen] = useState(false)

  // Track previous open state to detect when the dialog is opened
  const [prevOpen, setPrevOpen] = useState(open)

  // Adjust state during render phase to avoid "cascading renders" warning from useEffect
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setStep(initialStep)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Small delay to prevent layout shift during dialog close animation
      setTimeout(() => setStep('info'), 200)
    }
    onOpenChange(nextOpen)
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={step === 'management' ? tg.managementTitle : tg.title}
      headerLeft={
        step === 'management' ? (
          <button
            onClick={() => {
              setStep('info')
            }}
            className='p-1 -ml-1 hover:bg-muted rounded-full transition-colors outline-none cursor-pointer shrink-0'
            aria-label={tg.backToInfo}
          >
            <ArrowLeft className='w-5 h-5 text-foreground' />
          </button>
        ) : undefined
      }
      noContentPadding={true}
      className='overflow-hidden w-108 max-w-[95vw]'
    >
      <div className='h-138 overflow-hidden'>
        <AnimatePresence initial={false} mode='wait'>
          {step === 'info' ? (
            <motion.div
              key='group-info-overview'
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
              className='h-full'
            >
              <GroupInfoOverviewStep
                conversation={conversation}
                currentUserId={currentUserId}
                text={tg}
                onAvatarClick={onAvatarClick}
                onRenameClick={onRenameClick}
                onCloseDialog={() => handleOpenChange(false)}
                onOpenManagement={() => {
                  setStep('management')
                }}
                onLeaveGroup={() => setIsLeaveGroupDialogOpen(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key='group-info-management'
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
              className='h-full'
            >
              <GroupManagementStep
                text={tg}
                conversationId={conversation.id}
                onDisbandSuccess={() => handleOpenChange(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LeaveGroupDialog
        open={isLeaveGroupDialogOpen}
        onOpenChange={setIsLeaveGroupDialogOpen}
        conversationId={conversation.id}
      />
    </BaseDialog>
  )
}
