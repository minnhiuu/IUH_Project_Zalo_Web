import { useState } from 'react'
import { BaseDialog } from '@/components/common/base-dialog'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/common/user-avatar'
import { GroupAvatar } from './group-avatar'
import { useChatText } from '../../i18n/use-chat-text'
import type { ConversationResponse } from '../../schemas/chat.schema'
import { getConversationDisplayName } from '../../utils/group-name'

interface RenameGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversation: ConversationResponse
  currentUserId?: string
  onConfirm: (newName: string) => void
  isPending?: boolean
}

export function RenameGroupDialog({
  open,
  onOpenChange,
  conversation,
  currentUserId,
  onConfirm,
  isPending
}: RenameGroupDialogProps) {
  const { text } = useChatText()
  const tg = text['rename-group-dialog']
  const currentDisplayName = getConversationDisplayName(conversation, 'Group', undefined, currentUserId)
  const [newGroupName, setNewGroupName] = useState(currentDisplayName)

  const handleConfirm = () => {
    const trimmed = newGroupName.trim()
    // If nothing changed from what's currently displayed, just close
    if (trimmed === currentDisplayName) {
      onOpenChange(false)
      return
    }
    // If name is already dynamic (null) and input is cleared, just close
    if (!trimmed && !conversation.name) {
      onOpenChange(false)
      return
    }
    onConfirm(trimmed)
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tg.title}
      confirmText={tg.confirm}
      cancelText={tg.cancel}
      onConfirm={handleConfirm}
      isPending={isPending}
    >
      <div className='space-y-4'>
        <div className='flex justify-center'>
          <div className='relative shrink-0'>
            {conversation.avatar ? (
              <UserAvatar
                src={conversation.avatar}
                name={getConversationDisplayName(conversation, 'Group', undefined, currentUserId)}
                className='w-16 h-16 shadow-md'
              />
            ) : (
              <GroupAvatar
                avatars={conversation.members?.map((m) => m.avatar) || []}
                names={conversation.members?.map((m) => m.fullName) || []}
                count={conversation.members?.length || 0}
                size='lg'
              />
            )}
          </div>
        </div>
        <p className='text-[14.5px] text-center text-foreground px-4 leading-normal font-medium'>{tg.description}</p>
        <div className='px-1'>
          <Input
            autoFocus
            onFocus={(e) => e.target.select()}
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder={tg.placeholder}
            className='h-10 text-[15px]'
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
        </div>
      </div>
    </BaseDialog>
  )
}
