import { ArrowLeft, X } from 'lucide-react'
import { useChatText } from '../../../i18n/use-chat-text'
import type { ConversationResponse } from '../../../schemas/chat.schema'
import { useState } from 'react'
import { GroupManagementStep } from '../steps/group-management-step'
import { GroupInfoOverviewStep } from '../steps/group-info-overview-step'
import { AnimatePresence, motion } from 'framer-motion'
import { LeaveGroupDialog } from './leave-group-dialog'
import { cn } from '@/lib/utils'
import { GroupMemberRole } from '@/constants/enum'

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

  // Track previous open state to detect when the panel is opened
  const [prevOpen, setPrevOpen] = useState(open)

  // Adjust state during render phase to avoid "cascading renders" warning from useEffect
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setStep(initialStep)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => setStep('info'), 200)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop for small screens */}
      <div
        className='absolute inset-0 bg-transparent z-90 min-[1150px]:hidden animate-in fade-in duration-200 cursor-pointer'
        onClick={handleClose}
      />

      <div
        className={cn(
          'w-87.5 border-l border-border bg-background flex flex-col h-full overflow-hidden shrink-0',
          'shadow-xl min-[1150px]:shadow-none min-[1150px]:relative absolute right-0 top-0 z-100'
        )}
      >
        {/* Header */}
        <div className='h-17 flex items-center border-b border-border shrink-0 px-4 gap-2'>
          {step === 'management' && (
            <button
              onClick={() => setStep('info')}
              className='p-1 -ml-1 hover:bg-muted rounded-full transition-colors outline-none cursor-pointer shrink-0'
              aria-label={tg.backToInfo}
            >
              <ArrowLeft className='w-5 h-5 text-foreground' />
            </button>
          )}
          <h2 className='font-bold text-[16px] text-foreground flex-1 text-center'>
            {step === 'management' ? tg.managementTitle : tg.title}
          </h2>
          <button
            onClick={handleClose}
            className='p-1 hover:bg-muted rounded-full transition-colors outline-none cursor-pointer shrink-0'
          >
            <X className='w-5 h-5 text-foreground' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-hidden'>
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
                  onCloseDialog={handleClose}
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
                  settings={conversation.settings}
                  joinLinkToken={conversation.joinLinkToken}
                  currentUserRole={
                    (conversation.members?.find((m) => m.userId === currentUserId)?.role as GroupMemberRole) ||
                    GroupMemberRole.Member
                  }
                  onDisbandSuccess={handleClose}
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
      </div>
    </>
  )
}
