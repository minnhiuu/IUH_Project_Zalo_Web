import { useCallback, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { HelpTooltipIcon } from '@/components/common/help-tooltip-icon'
import { ActionMenuItem } from '@/components/common/action-menu-item'
import { UserRoundPlus, UserRoundX, Users, ChevronDown, Lock, Copy, Forward, RefreshCw } from 'lucide-react'
import { BaseDialog } from '@/components/common/base-dialog'
import { Button } from '@/components/ui/button'
import { disbandGroupApi } from '../../../api/chat.api'
import { GroupMemberRole } from '@/constants/enum'
import { useUpdateGroupSettingsMutation, useRefreshJoinLinkMutation } from '../../../queries/use-mutations'
import { showSimpleToast } from '@/utils/toast'
import type { GroupSettings } from '../../../schemas/chat.schema'
import { useChatContext } from '../../../context/chat-context'
import { ForwardDialog } from '../../forward-dialog'
import { cn } from '@/lib/utils'
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
  settings?: GroupSettings | null
  joinLinkToken?: string | null
  memberCount?: number
  onDisbandSuccess?: () => void
  onGoToAdmins?: () => void
  onGoToBlocked?: () => void
}

export function GroupManagementStep({
  text,
  conversationId,
  currentUserRole,
  settings,
  joinLinkToken,
  memberCount = 0,
  onDisbandSuccess,
  onGoToAdmins,
  onGoToBlocked
}: GroupManagementStepProps & { currentUserRole?: GroupMemberRole }) {
  const { sendMessage } = useChatContext()
  const { mutate: updateSettings } = useUpdateGroupSettingsMutation()
  const { mutate: refreshJoinLink, isPending: isRefreshing } = useRefreshJoinLinkMutation()

  const handleSettingChange = useCallback(
    (key: keyof GroupSettings, value: boolean) => {
      updateSettings({ conversationId, settings: { [key]: value } })
    },
    [conversationId, updateSettings]
  )

  const [isDisbandDialogOpen, setIsDisbandDialogOpen] = useState(false)
  const [isDisbanding, setIsDisbanding] = useState(false)
  const [isShareLinkOpen, setIsShareLinkOpen] = useState(false)

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
  const isMember = currentUserRole === GroupMemberRole.Member
  const isReadOnly = isMember

  const AdminOnlyBanner = () => (
    <div className='bg-[#ebecf0] dark:bg-[#1d2025] px-4 py-2.5 flex items-center justify-center gap-2 text-[13px] transition-colors'>
      <Lock className='w-3.5 h-3.5 shrink-0 text-muted-foreground' />
      <span className='font-medium readonly-management-text'>Tính năng chỉ dành cho quản trị viên</span>
    </div>
  )

  return (
    <div
      className={`flex flex-col h-full overflow-y-auto overflow-x-hidden bg-bg-dialog-secondary w-full text-left custom-scrollbar ${
        isReadOnly ? 'cursor-not-allowed' : ''
      }`}
    >
      {isReadOnly && <AdminOnlyBanner />}

      <div className={`bg-background px-5 py-3 border-b border-border/50 ${isReadOnly ? 'pointer-events-none' : ''}`}>
        <p className={`text-[14px] font-bold mb-3 ${isReadOnly ? 'readonly-management-text' : 'text-foreground'}`}>
          {text.memberPermissionsTitle}
        </p>
        <div className='space-y-1.5'>
          <label
            className={`flex items-center justify-between gap-3 py-1.5 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <span className={`text-[14px] ${isReadOnly ? 'readonly-management-text' : 'text-foreground'}`}>
              {text.permissions.updateNameAvatar}
            </span>
            <input
              type='checkbox'
              disabled={isReadOnly}
              checked={settings?.memberCanChangeInfo ?? true}
              onChange={(e) => handleSettingChange('memberCanChangeInfo', e.target.checked)}
              className={`h-4 w-4 accent-primary cursor-pointer disabled:cursor-default ${isReadOnly ? 'readonly-management-checkbox' : ''}`}
            />
          </label>
          <label
            className={`flex items-center justify-between gap-3 py-1.5 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <span className={`text-[14px] ${isReadOnly ? 'readonly-management-text' : 'text-foreground'}`}>
              {text.permissions.pinNotePoll}
            </span>
            <input
              type='checkbox'
              disabled={isReadOnly}
              checked={settings?.memberCanPinMessages ?? true}
              onChange={(e) => handleSettingChange('memberCanPinMessages', e.target.checked)}
              className={`h-4 w-4 accent-primary cursor-pointer disabled:cursor-default ${isReadOnly ? 'readonly-management-checkbox' : ''}`}
            />
          </label>
          <label
            className={`flex items-center justify-between gap-3 py-1.5 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <span className={`text-[14px] ${isReadOnly ? 'readonly-management-text' : 'text-foreground'}`}>
              {text.permissions.createReminder}
            </span>
            <input
              type='checkbox'
              disabled={isReadOnly}
              checked={settings?.memberCanCreateNotes ?? true}
              onChange={(e) => handleSettingChange('memberCanCreateNotes', e.target.checked)}
              className={`h-4 w-4 accent-primary cursor-pointer disabled:cursor-default ${isReadOnly ? 'readonly-management-checkbox' : ''}`}
            />
          </label>
          <label
            className={`flex items-center justify-between gap-3 py-1.5 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <span className={`text-[14px] ${isReadOnly ? 'readonly-management-text' : 'text-foreground'}`}>
              {text.permissions.createPoll}
            </span>
            <input
              type='checkbox'
              disabled={isReadOnly}
              checked={settings?.memberCanCreatePolls ?? true}
              onChange={(e) => handleSettingChange('memberCanCreatePolls', e.target.checked)}
              className={`h-4 w-4 accent-primary cursor-pointer disabled:cursor-default ${isReadOnly ? 'readonly-management-checkbox' : ''}`}
            />
          </label>
          <label
            className={`flex items-center justify-between gap-3 py-1.5 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <span className={`text-[14px] ${isReadOnly ? 'readonly-management-text' : 'text-foreground'}`}>
              {text.permissions.sendMessage}
            </span>
            <input
              type='checkbox'
              disabled={isReadOnly}
              checked={settings?.memberCanSendMessages ?? true}
              onChange={(e) => handleSettingChange('memberCanSendMessages', e.target.checked)}
              className={`h-4 w-4 accent-primary cursor-pointer disabled:cursor-default ${isReadOnly ? 'readonly-management-checkbox' : ''}`}
            />
          </label>
        </div>
      </div>

      <div className='mt-2 bg-background border-y border-border/50'>
        <div className='px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors'>
          <span className='text-[14px] font-bold'>Thành viên nhóm</span>
          <ChevronDown className='w-4 h-4 text-muted-foreground' />
        </div>

        <ActionMenuItem icon={<Users />} label={`${memberCount} thành viên`} as='div' />
      </div>

      <div className={`mt-2 bg-background border-y border-border/50 ${isReadOnly ? 'pointer-events-none' : ''}`}>
        <div className='px-5 py-3 space-y-0'>
          <div className='flex items-center justify-between gap-3 py-3 border-b border-border/60'>
            <div
              className={`flex items-center gap-2 min-w-0 flex-1 pr-2 text-[14px] font-semibold ${isReadOnly ? 'readonly-management-text' : 'text-foreground'}`}
            >
              <span className='min-w-0 wrap-break-word'>{text.toggles.reviewNewMembers}</span>
              <HelpTooltipIcon content={text.toggleTooltips.reviewNewMembers} />
            </div>
            <Switch
              disabled={isReadOnly}
              checked={settings?.membershipApprovalEnabled ?? false}
              onCheckedChange={(v) => handleSettingChange('membershipApprovalEnabled', v)}
            />
          </div>

          <div className='flex items-center justify-between gap-3 py-3 border-b border-border/60'>
            <div
              className={`flex items-center gap-2 min-w-0 flex-1 pr-2 text-[14px] font-semibold ${isReadOnly ? 'readonly-management-text' : 'text-foreground'}`}
            >
              <span className='min-w-0 wrap-break-word'>{text.toggles.highlightAdminMessages}</span>
              <HelpTooltipIcon content={text.toggleTooltips.highlightAdminMessages} />
            </div>
            <Switch
              disabled={isReadOnly}
              checked={settings?.highlightAdminMessages ?? true}
              onCheckedChange={(v) => handleSettingChange('highlightAdminMessages', v)}
            />
          </div>

          <div className='flex items-center justify-between gap-3 py-3 border-b border-border/60'>
            <div
              className={`flex items-center gap-2 min-w-0 flex-1 pr-2 text-[14px] font-semibold ${isReadOnly ? 'readonly-management-text' : 'text-foreground'}`}
            >
              <span className='min-w-0 wrap-break-word'>{text.toggles.allowNewMembersReadRecent}</span>
              <HelpTooltipIcon content={text.toggleTooltips.allowNewMembersReadRecent} />
            </div>
            <Switch
              disabled={isReadOnly}
              checked={settings?.newMembersCanReadRecent ?? true}
              onCheckedChange={(v) => handleSettingChange('newMembersCanReadRecent', v)}
            />
          </div>

          {!isReadOnly && (
            <div className='flex flex-col py-3'>
              <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-2 min-w-0 flex-1 pr-2 text-[14px] text-foreground font-semibold'>
                  <span className='min-w-0 wrap-break-word'>{text.toggles.allowJoinByLink}</span>
                  <HelpTooltipIcon content={text.toggleTooltips.allowJoinByLink} />
                </div>
                <Switch
                  disabled={isReadOnly}
                  checked={settings?.joinByLinkEnabled ?? false}
                  onCheckedChange={(v) => handleSettingChange('joinByLinkEnabled', v)}
                />
              </div>

              {/* Link section moved to main info sidebar per user request */}

              {settings?.joinByLinkEnabled && joinLinkToken && (
                <div
                  className='mt-2 p-2 px-3 border border-border/20 bg-color-B10'
                  style={{ backgroundColor: 'var(--B10)', borderRadius: '8px' }}
                >
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-[13px] font-medium truncate flex-1 min-w-0' style={{ color: 'var(--B70)' }}>
                      {`${window.location.origin}/g/${joinLinkToken}`}
                    </span>
                    <div className='flex items-center gap-1 shrink-0'>
                      <button
                        type='button'
                        className='z--btn--v2 btn-tertiary-primary icon-only medium'
                        title='Sao chép'
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/g/${joinLinkToken}`)
                          showSimpleToast('Đã sao chép')
                        }}
                      >
                        <Copy className='z--btn--icon-content' />
                      </button>
                      <button
                        type='button'
                        className='z--btn--v2 btn-tertiary-primary icon-only medium'
                        title='Chia sẻ'
                        onClick={() => setIsShareLinkOpen(true)}
                      >
                        <Forward className='z--btn--icon-content' />
                      </button>
                      <button
                        type='button'
                        className='z--btn--v2 btn-tertiary-primary icon-only medium'
                        title='Làm mới'
                        disabled={isRefreshing}
                        onClick={() => refreshJoinLink(conversationId)}
                      >
                        <RefreshCw className={cn('z--btn--icon-content', isRefreshing && 'animate-spin')} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className='mt-2 bg-background border-y border-border/50'>
        {!isMember && (
          <ActionMenuItem
            icon={<UserRoundX />}
            label={text.actions.removeMembers}
            showDivider={true}
            onClick={onGoToBlocked}
          />
        )}
        {isOwner && (
          <ActionMenuItem
            icon={<UserRoundPlus />}
            label={text.actions.ownerAndDeputy}
            showDivider={!isMember}
            onClick={onGoToAdmins}
          />
        )}
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

      {isShareLinkOpen && joinLinkToken && (
        <ForwardDialog
          open
          onClose={() => setIsShareLinkOpen(false)}
          title='Chia sẻ'
          confirmText='Chia sẻ'
          onConfirm={(selectedConvIds) => {
            const linkUrl = `${window.location.origin}/g/${joinLinkToken}`
            selectedConvIds.forEach((convId) => {
              sendMessage(convId, linkUrl, null, false)
            })
          }}
        />
      )}
    </div>
  )
}
