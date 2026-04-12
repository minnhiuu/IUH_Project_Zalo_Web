import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BaseDialog } from '@/components/common/base-dialog'
import { CharacterCounterTextarea } from '@/components/ui/character-counter-textarea'
import { useUpdateJoinQuestionMutation } from '../../../queries/use-mutations'
import { showSuccessToast } from '@/utils/toast'
import { useChatText } from '../../../i18n/use-chat-text'

interface UpdateJoinQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
  initialQuestion?: string | null
}

export function UpdateJoinQuestionDialog({
  open,
  onOpenChange,
  conversationId,
  initialQuestion
}: UpdateJoinQuestionDialogProps) {
  const { text: tg } = useChatText()
  const text = tg['group-info-dialog']
  const { t: tc } = useTranslation('common')

  const [joinQuestion, setJoinQuestion] = useState(initialQuestion ?? '')

  const { mutate: updateJoinQuestion, isPending } = useUpdateJoinQuestionMutation()
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setJoinQuestion(initialQuestion ?? '')
    }
  }

  const handleConfirm = () => {
    updateJoinQuestion(
      { conversationId, question: joinQuestion.trim() },
      {
        onSuccess: () => {
          onOpenChange(false)
          showSuccessToast(text.joinQuestionUpdateSuccess)
        }
      }
    )
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={text.joinQuestion}
      confirmText={tc('save')}
      cancelText={tc('cancel')}
      onConfirm={handleConfirm}
      isPending={isPending}
      hideFooterBorder
    >
      <div className='py-2 space-y-4'>
        <p className='text-[14.5px] text-foreground/80 leading-relaxed px-1'>{text.joinQuestionDesc}</p>

        <div className='space-y-2'>
          <CharacterCounterTextarea
            maxLength={250}
            placeholder={text.joinQuestionPlaceholder}
            value={joinQuestion}
            onChange={(e) => setJoinQuestion(e.target.value)}
            className='min-h-[140px] text-[14px] resize-none text-foreground focus-visible:border-foreground/30 focus-visible:ring-0'
            counterClassName='group-focus-within/counter:text-muted-foreground/80'
          />
        </div>
      </div>
    </BaseDialog>
  )
}
