import { useState, useMemo } from 'react'
import { BaseDialog } from '@/components/common/base-dialog'
import { UserAvatar } from '@/components/common/user-avatar'
import { KeyRound, Search } from 'lucide-react'
import { useChatText } from '../../../i18n/use-chat-text'
import type { ConversationMemberResponse } from '../../../schemas/chat.schema'

interface TransferOwnerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: ConversationMemberResponse[]
  currentUserId?: string
  onSelect: (targetUserId: string) => void
}

export function TransferOwnerDialog({
  open,
  onOpenChange,
  members,
  currentUserId,
  onSelect
}: TransferOwnerDialogProps) {
  const { text } = useChatText()
  const dialogText = text['group-info-dialog'].actions.transferOwnerDialog
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const eligibleMembers = useMemo(() => {
    return (members || []).filter((m) => m.userId !== currentUserId && m.role?.toUpperCase() !== 'OWNER')
  }, [members, currentUserId])

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return eligibleMembers
    const query = searchQuery.toLowerCase().trim()
    return eligibleMembers.filter((m) => m.fullName.toLowerCase().includes(query))
  }, [eligibleMembers, searchQuery])

  const handleConfirm = () => {
    if (!selectedUserId) return
    const userId = selectedUserId
    setSelectedUserId(null)
    setSearchQuery('')
    onOpenChange(false)
    onSelect(userId)
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSelectedUserId(null)
          setSearchQuery('')
        }
        onOpenChange(nextOpen)
      }}
      title={dialogText.title}
      confirmText={dialogText.confirm}
      cancelText={dialogText.cancel}
      onConfirm={handleConfirm}
      isPending={!selectedUserId}
      className='w-110 max-w-[95vw]'
      noContentPadding
    >
      <div className='px-4 pt-3'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dialogText.searchPlaceholder}
            className='w-full pl-9 pr-3 py-2 text-[14px] rounded-md border border-border bg-muted/30 outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground'
          />
        </div>
      </div>

      <div className='mt-2 max-h-72 overflow-y-auto custom-scrollbar'>
        {filteredMembers.map((member) => (
          <label
            key={member.userId}
            className='flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors'
          >
            <input
              type='radio'
              name='transfer-owner-target'
              value={member.userId}
              checked={selectedUserId === member.userId}
              onChange={() => setSelectedUserId(member.userId)}
              className='w-4 h-4 accent-primary shrink-0'
            />
            <div className='relative shrink-0'>
              <UserAvatar src={member.avatar} name={member.fullName} className='w-10 h-10' />
              {member.role?.toUpperCase() === 'ADMIN' && (
                <span className='member-role-key-badge absolute -right-0.5 -bottom-0.5 w-4 h-4 rounded-full flex items-center justify-center border border-background'>
                  <KeyRound strokeWidth={2.75} className='member-role-key-icon-admin w-2.5 h-2.5' />
                </span>
              )}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-[14px] font-medium text-foreground truncate'>{member.fullName}</p>
              {member.role && member.role.toUpperCase() === 'ADMIN' && (
                <p className='text-[12px] text-muted-foreground'>Admin</p>
              )}
            </div>
          </label>
        ))}

        {filteredMembers.length === 0 && (
          <div className='py-8 text-center text-[14px] text-muted-foreground'>
            {searchQuery.trim() ? 'No members found' : 'No eligible members'}
          </div>
        )}
      </div>
    </BaseDialog>
  )
}
