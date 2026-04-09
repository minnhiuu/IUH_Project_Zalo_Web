import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { HelpTooltipIcon } from '@/components/common/help-tooltip-icon'
import { ActionMenuItem } from '@/components/common/action-menu-item'
import { UserRoundPlus, UserRoundX } from 'lucide-react'
import { BaseDialog } from '@/components/common/base-dialog'
import { Button } from '@/components/ui/button'
import { disbandGroupApi } from '../../../api/chat.api'
import { GroupMemberRole } from '@/constants/enum'
import { Ban } from 'lucide-react'
interface GroupManagementStepText {
  memberPermissionsTitle: string
  permissions: {
    updateNameAvatar: string
    pinNotePoll: string
    createReminder: string
    createPoll: string
    sendMessage: string
  }
  toggles: {
    reviewNewMembers: string
    highlightAdminMessages: string
    allowNewMembersReadRecent: string
    allowJoinByLink: string
  }
  toggleTooltips: {
    reviewNewMembers: string
    highlightAdminMessages: string
    allowNewMembersReadRecent: string
    allowJoinByLink: string
  }
  actions: {
    removeMembers: string
    ownerAndDeputy: string
    disbandGroup: string
    disbandDialog: {
      title: string
      description: string
      confirm: string
      cancel: string
    }
  }
}

interface GroupManagementStepProps {
  text: GroupManagementStepText
  conversationId: string
  onDisbandSuccess?: () => void
}

export function GroupManagementStep({
  text,
  conversationId,
  currentUserRole,
  onDisbandSuccess
}: GroupManagementStepProps & { currentUserRole?: GroupMemberRole }) {
  // ... rest of the component stays the same, just finding the button ...
  const [allowUpdateNameAvatar, setAllowUpdateNameAvatar] = useState(true)
  const [allowPinNotePoll, setAllowPinNotePoll] = useState(true)
  const [allowCreateReminder, setAllowCreateReminder] = useState(true)
  const [allowCreatePoll, setAllowCreatePoll] = useState(true)
  const [allowSendMessage, setAllowSendMessage] = useState(true)

  const [reviewNewMembers, setReviewNewMembers] = useState(false)
  const [highlightAdminMessages, setHighlightAdminMessages] = useState(true)
  const [allowNewMembersReadRecent, setAllowNewMembersReadRecent] = useState(true)
  const [allowJoinByLink, setAllowJoinByLink] = useState(false)

  const [isDisbandDialogOpen, setIsDisbandDialogOpen] = useState(false)
  const [isDisbanding, setIsDisbanding] = useState(false)

  const handleDisband = async () => {
    try {
      setIsDisbanding(true)
      await disbandGroupApi(conversationId)
      setIsDisbandDialogOpen(false)
      onDisbandSuccess?.()
    } catch (error) {
      console.error('Failed to disband group:', error)
    } finally {
      setIsDisbanding(false)
    }
  }

  const isOwner = !currentUserRole || currentUserRole === GroupMemberRole.Owner
  const isAdmin = currentUserRole === GroupMemberRole.Admin
  const isMember = currentUserRole === GroupMemberRole.Member

  if (isMember) {
    return (
      <div className='flex flex-col h-full bg-bg-dialog-secondary'>
        <div className='bg-background border-b border-border/50 px-4 py-3 flex items-center gap-2 text-[13px] text-muted-foreground'>
          <Ban className='w-4 h-4 shrink-0' />
          <span>Tính năng chỉ dành cho quản trị viên</span>
        </div>
        <div className='flex-1 group relative overflow-hidden'>
          <div className='absolute inset-0 opacity-30 pointer-events-none overflow-y-auto'>
            <div className='bg-background px-5 py-3'>
              <p className='text-[14px] font-bold text-foreground mb-3'>{text.memberPermissionsTitle}</p>
            </div>
          </div>
          <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
            <Ban className='w-16 h-16 text-muted-foreground/40' />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full overflow-y-auto overflow-x-hidden bg-bg-dialog-secondary w-full text-left'>
      {isAdmin && (
        <div className='bg-background border-b border-border/50 px-4 py-3 flex items-center gap-2 text-[13px] text-muted-foreground'>
          <Ban className='w-4 h-4 shrink-0' />
          <span>Tính năng chỉ dành cho quản trị viên</span>
        </div>
      )}
      <div className='bg-background px-5 py-3 border-b border-border/50'>
        <p className='text-[14px] font-bold text-foreground mb-3'>{text.memberPermissionsTitle}</p>
        <div className='space-y-1.5'>
          <label className='flex items-center justify-between gap-3 cursor-pointer py-1.5'>
            <span className='text-[14px] text-foreground'>{text.permissions.updateNameAvatar}</span>
            <input
              type='checkbox'
              checked={allowUpdateNameAvatar}
              onChange={(e) => setAllowUpdateNameAvatar(e.target.checked)}
              className='h-4 w-4 accent-primary cursor-pointer'
            />
          </label>
          <label className='flex items-center justify-between gap-3 cursor-pointer py-1.5'>
            <span className='text-[14px] text-foreground'>{text.permissions.pinNotePoll}</span>
            <input
              type='checkbox'
              checked={allowPinNotePoll}
              onChange={(e) => setAllowPinNotePoll(e.target.checked)}
              className='h-4 w-4 accent-primary cursor-pointer'
            />
          </label>
          <label className='flex items-center justify-between gap-3 cursor-pointer py-1.5'>
            <span className='text-[14px] text-foreground'>{text.permissions.createReminder}</span>
            <input
              type='checkbox'
              checked={allowCreateReminder}
              onChange={(e) => setAllowCreateReminder(e.target.checked)}
              className='h-4 w-4 accent-primary cursor-pointer'
            />
          </label>
          <label className='flex items-center justify-between gap-3 cursor-pointer py-1.5'>
            <span className='text-[14px] text-foreground'>{text.permissions.createPoll}</span>
            <input
              type='checkbox'
              checked={allowCreatePoll}
              onChange={(e) => setAllowCreatePoll(e.target.checked)}
              className='h-4 w-4 accent-primary cursor-pointer'
            />
          </label>
          <label className='flex items-center justify-between gap-3 cursor-pointer py-1.5'>
            <span className='text-[14px] text-foreground'>{text.permissions.sendMessage}</span>
            <input
              type='checkbox'
              checked={allowSendMessage}
              onChange={(e) => setAllowSendMessage(e.target.checked)}
              className='h-4 w-4 accent-primary cursor-pointer'
            />
          </label>
        </div>
      </div>

      <div className='mt-2 bg-background border-y border-border/50'>
        <div className='px-5 py-3 space-y-0'>
          <div className='flex items-center justify-between gap-3 py-3 border-b border-border/60'>
            <div className='flex items-center gap-2 min-w-0 flex-1 pr-2 text-[14px] text-foreground font-semibold'>
              <span className='min-w-0 wrap-break-word'>{text.toggles.reviewNewMembers}</span>
              <HelpTooltipIcon content={text.toggleTooltips.reviewNewMembers} />
            </div>
            <Switch checked={reviewNewMembers} onCheckedChange={setReviewNewMembers} />
          </div>

          <div className='flex items-center justify-between gap-3 py-3 border-b border-border/60'>
            <div className='flex items-center gap-2 min-w-0 flex-1 pr-2 text-[14px] text-foreground font-semibold'>
              <span className='min-w-0 wrap-break-word'>{text.toggles.highlightAdminMessages}</span>
              <HelpTooltipIcon content={text.toggleTooltips.highlightAdminMessages} />
            </div>
            <Switch checked={highlightAdminMessages} onCheckedChange={setHighlightAdminMessages} />
          </div>

          <div className='flex items-center justify-between gap-3 py-3 border-b border-border/60'>
            <div className='flex items-center gap-2 min-w-0 flex-1 pr-2 text-[14px] text-foreground font-semibold'>
              <span className='min-w-0 wrap-break-word'>{text.toggles.allowNewMembersReadRecent}</span>
              <HelpTooltipIcon content={text.toggleTooltips.allowNewMembersReadRecent} />
            </div>
            <Switch checked={allowNewMembersReadRecent} onCheckedChange={setAllowNewMembersReadRecent} />
          </div>

          <div className='flex items-center justify-between gap-3 py-3'>
            <div className='flex items-center gap-2 min-w-0 flex-1 pr-2 text-[14px] text-foreground font-semibold'>
              <span className='min-w-0 wrap-break-word'>{text.toggles.allowJoinByLink}</span>
              <HelpTooltipIcon content={text.toggleTooltips.allowJoinByLink} />
            </div>
            <Switch checked={allowJoinByLink} onCheckedChange={setAllowJoinByLink} />
          </div>
        </div>
      </div>

      <div className='mt-2 bg-background border-y border-border/50'>
        <ActionMenuItem icon={<UserRoundX />} label={text.actions.removeMembers} showDivider={true} />
        {isOwner && <ActionMenuItem icon={<UserRoundPlus />} label={text.actions.ownerAndDeputy} showDivider={true} />}
      </div>

      {isOwner && (
        <div className='mt-2 bg-background border-y border-border/50 p-4'>
          <Button variant='destructive' onClick={() => setIsDisbandDialogOpen(true)} className='w-full cursor-pointer'>
            {text.actions.disbandGroup}
          </Button>
        </div>
      )}
      <div className='flex-1 bg-background' />

      <BaseDialog
        open={isDisbandDialogOpen}
        onOpenChange={setIsDisbandDialogOpen}
        title={text.actions.disbandDialog.title}
        description={text.actions.disbandDialog.description}
        confirmText={text.actions.disbandDialog.confirm}
        cancelText={text.actions.disbandDialog.cancel}
        onConfirm={handleDisband}
        isPending={isDisbanding}
        variant='danger'
      />
    </div>
  )
}
