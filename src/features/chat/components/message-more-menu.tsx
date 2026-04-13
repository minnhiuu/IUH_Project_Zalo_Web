import { Copy, Pin, Star, List, CircleAlert, Trash2, FolderHeart, AlarmClockPlus, RotateCcw } from 'lucide-react'
import {
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu'
import { ActionMenuItem } from '@/components/common/action-menu-item'

interface MessageBubbleMenuText {
  copy: string
  pinMessage: string
  starMessage: string
  selectMessages: string
  viewDetails: string
  otherOptions: string
  saveToMyDocuments: string
  createReminder: string
  revoke: string
  deleteForMe: string
  delete: string
  more: string
}

interface MessageMoreMenuProps {
  side: 'left' | 'right'
  text: MessageBubbleMenuText
  messageContent: string
  isOwn: boolean
  onDeleteForMe: () => void
  onRevoke?: () => void
}

export function MessageMoreMenu({ side, text, messageContent, isOwn, onDeleteForMe, onRevoke }: MessageMoreMenuProps) {
  return (
    <DropdownMenuContent side={side} align='start' sideOffset={4} className='w-62 rounded-xl '>
      <ActionMenuItem icon={<Copy />} label={text.copy} onClick={() => navigator.clipboard.writeText(messageContent)} />
      <ActionMenuItem icon={<Pin />} label={text.pinMessage} onClick={() => {}} />
      <ActionMenuItem icon={<Star />} label={text.starMessage} onClick={() => {}} />
      <ActionMenuItem icon={<List />} label={text.selectMessages} onClick={() => {}} />
      <ActionMenuItem icon={<CircleAlert />} label={text.viewDetails} onClick={() => {}} />

      <DropdownMenuSub>
        <DropdownMenuSubTrigger className='flex w-full items-center gap-3 px-4 py-2.5 text-[0.875rem] transition-all text-left cursor-pointer hover:bg-muted/50 rounded-sm'>
          <span className='shrink-0 w-5 h-5' />
          <span className='flex-1 truncate text-foreground'>{text.otherOptions}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className='w-56 rounded-xl '>
          <ActionMenuItem icon={<FolderHeart />} label={text.saveToMyDocuments} onClick={() => {}} />
          <ActionMenuItem icon={<AlarmClockPlus />} label={text.createReminder} onClick={() => {}} />
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      {isOwn && onRevoke && (
        <ActionMenuItem icon={<RotateCcw />} label={text.revoke} variant='destructive' showDivider onClick={onRevoke} />
      )}

      <ActionMenuItem
        icon={<Trash2 />}
        label={isOwn ? text.deleteForMe : text.delete}
        variant='destructive'
        showDivider={!isOwn}
        onClick={onDeleteForMe}
      />
    </DropdownMenuContent>
  )
}
