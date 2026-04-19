import { useState, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/common/user-avatar'
import { GroupAvatar } from '@/components/common/group-avatar'
import { ActionMenuItem } from '@/components/common/action-menu-item'
import { ChatInfoTopSection } from '../../chat-info-top-section'
import { ChatInfoSections } from '../../chat-info-sections'
import { MediaStorageView } from '../../media-storage-view'
import { DisappearingMessagesDialog } from '@/components/common/disappearing-messages-dialog'
import { CreateGroupDialog } from '../dialogs/create-group-dialog'
import { LeaveGroupDialog } from '../dialogs/leave-group-dialog'
import { TransferOwnerDialog } from '../dialogs/transfer-owner-dialog'
import type { ConversationResponse } from '../../../schemas/chat.schema'
import { useChatText } from '../../../i18n/use-chat-text'
import { useAuth } from '@/features/auth'
import { useDeleteConversationMutation } from '../../../queries/use-mutations'
import { GroupMemberRole } from '@/constants/enum'
import { getConversationDisplayName } from '../../../utils/group-name'
import { useGenerateJoinLinkMutation } from '../../../queries/use-mutations'
import { useChatContext } from '../../../context/chat-context'
import { ForwardDialog } from '../../forward-dialog'

interface GroupInfoStepProps {
  conversation: ConversationResponse
  onGoToManagement: () => void
  onGoToMembers: () => void
  onAvatarClick?: () => void
  onRenameClick?: () => void
}

export function GroupInfoStep({
  conversation,
  onGoToManagement,
  onGoToMembers,
  onAvatarClick,
  onRenameClick
}: GroupInfoStepProps) {
  const { text: tg } = useChatText()
  const { user } = useAuth()
  const { mutate: deleteConversation } = useDeleteConversationMutation()

  const currentMember = conversation.members?.find((m) => m.userId === user?.id)
  const currentUserRole = (currentMember?.role?.toUpperCase() as GroupMemberRole) || GroupMemberRole.Member
  const isMemberOnly = currentUserRole === GroupMemberRole.Member
  const isOwner = currentUserRole === GroupMemberRole.Owner

  const [isDisappearingDialogOpen, setIsDisappearingDialogOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isLeaveGroupDialogOpen, setIsLeaveGroupDialogOpen] = useState(false)
  const [isTransferOwnerDialogOpen, setIsTransferOwnerDialogOpen] = useState(false)
  const [pendingTransferTargetId, setPendingTransferTargetId] = useState<string | null>(null)
  const [isShareLinkOpen, setIsShareLinkOpen] = useState(false)
  const [storageOpen, setStorageOpen] = useState(false)
  const [storageTab, setStorageTab] = useState<'media' | 'files' | 'links'>('media')

  // Đảm bảo cả mình lẫn các thành viên khác đều xuất hiện trong bộ lọc "Người gửi"
  const allMembersForFilter = useMemo(() => {
    const list = conversation.members || []
    const hasSelf = list.some((m) => m.userId === user?.id)
    if (hasSelf || !user) return list
    return [{ userId: user.id, fullName: `${user.fullName} (Bạn)`, avatar: user.avatar ?? null, role: null }, ...list]
  }, [conversation.members, user])

  const { sendMessage } = useChatContext()
  const { mutate: generateJoinLink, isPending: isGenerating } = useGenerateJoinLinkMutation()

  const handleLeaveGroup = () => {
    if (isOwner) {
      setIsTransferOwnerDialogOpen(true)
    } else {
      setIsLeaveGroupDialogOpen(true)
    }
  }

  return (
    <div
      className={cn(
        'chat-info-sidebar w-87.5 border-l border-border bg-background flex flex-col h-full overflow-hidden shrink-0 shadow-xl min-[1150px]:shadow-none'
      )}
    >
      {storageOpen ? (
        <MediaStorageView
          conversationId={conversation.id}
          members={allMembersForFilter}
          defaultTab={storageTab}
          onClose={() => setStorageOpen(false)}
        />
      ) : (
        <>
          <div className='h-17 flex items-center justify-center border-b border-border shrink-0 px-4'>
            <h2 className='font-bold text-[16px] text-foreground'>{tg.sidebarInfo.groupTitle}</h2>
          </div>

          <div className='flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-background'>
            {conversation.isDisbanded ? (
              <div className='flex flex-col h-full bg-background'>
                <div className='flex flex-col items-center p-6 pb-4'>
                  <div className='relative mb-4'>
                    {!conversation.avatar ? (
                      <GroupAvatar
                        avatars={conversation.members?.map((m) => m.avatar) || []}
                        names={conversation.members?.map((m) => m.fullName) || []}
                        count={conversation.members?.length || 0}
                        size='xl'
                      />
                    ) : (
                      <UserAvatar
                        src={conversation.avatar}
                        name={getConversationDisplayName(conversation, tg.user, undefined, user?.id)}
                        className='w-24 h-24 shadow-md'
                      />
                    )}
                  </div>
                  <h3 className='font-bold text-[20px] text-foreground text-center mb-1'>
                    {getConversationDisplayName(conversation, 'Group', undefined, user?.id)}
                  </h3>
                  <p className='text-muted-foreground text-[14px] text-center px-4 mb-2'>{tg.disbanded.message}</p>
                </div>

                <div className='h-2 bg-secondary/80 border-y border-border/20' />
                <div className='py-1'>
                  <ActionMenuItem
                    icon={<Trash2 className='text-destructive-subtle-text' />}
                    label={tg.disbanded.deleteAction}
                    variant='destructive'
                    onClick={() => {
                      deleteConversation(conversation.id)
                    }}
                  />
                </div>

                <div className='h-2 bg-secondary' />
              </div>
            ) : (
              <>
                <ChatInfoTopSection
                  conversation={conversation}
                  isGroup={true}
                  currentUserId={user?.id}
                  text={{
                    muteNotifications: tg.sidebarInfo.muteNotifications,
                    pin: tg.sidebarInfo.pin,
                    addMember: tg.sidebarInfo.addMember,
                    settings: tg.sidebarInfo.settings,
                    createGroup: tg.sidebarInfo.createGroup,
                    user: tg.user
                  }}
                  onAvatarClick={onAvatarClick}
                  onRenameClick={onRenameClick}
                  onOpenAddMember={() => setIsAddMemberOpen(true)}
                  onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
                  onOpenManagement={onGoToManagement}
                />

                <div className='h-2 bg-secondary' />
                <ChatInfoSections
                  isGroup={true}
                  isMemberOnly={isMemberOnly}
                  conversationId={conversation.id}
                  members={conversation.members}
                  text={{
                    members: tg.sidebarInfo.members,
                    pendingJoinRequestsLabel: tg.sidebarInfo.pendingJoinRequestsLabel,
                    groupBoard: tg.sidebarInfo.groupBoard,
                    reminderBoard: tg.sidebarInfo.reminderBoard,
                    notesPinsPolls: tg.sidebarInfo.notesPinsPolls,
                    commonGroupsCount: tg.sidebarInfo.commonGroupsCount,
                    photosVideos: tg.sidebarInfo.photosVideos,
                    files: tg.sidebarInfo.files,
                    links: tg.sidebarInfo.links,
                    privacySettings: tg.sidebarInfo.privacySettings,
                    disappearingMessages: tg.sidebarInfo.disappearingMessages,
                    disappearingMessagesTooltip: tg.sidebarInfo.disappearingMessagesTooltip,
                    disappearingMessagesWarning: tg.sidebarInfo.disappearingMessagesWarning,
                    never: tg.sidebarInfo.never,
                    hideConversation: tg.sidebarInfo.hideConversation,
                    reportAction: tg.sidebarInfo.reportAction,
                    deleteHistory: tg.sidebarInfo.deleteHistory,
                    leaveGroup: tg.sidebarInfo.leaveGroup,
                    viewAll: tg.sidebarInfo.viewAll
                  }}
                  membersCountLabel={tg.status.membersCount(conversation.members?.length || 0)}
                  pendingRequestsCount={conversation.pendingJoinRequestCount ?? 0}
                  onOpenMembers={onGoToMembers}
                  onOpenDisappearingDialog={() => setIsDisappearingDialogOpen(true)}
                  onLeaveGroup={handleLeaveGroup}
                  joinLinkToken={conversation.joinLinkToken}
                  joinByLinkEnabled={conversation.settings?.joinByLinkEnabled}
                  isReadOnly={isMemberOnly}
                  isGenerating={isGenerating}
                  onGenerateJoinLink={() => generateJoinLink(conversation.id)}
                  onShareLink={() => setIsShareLinkOpen(true)}
                  onOpenStorage={(tab) => {
                    setStorageTab(tab)
                    setStorageOpen(true)
                  }}
                />
              </>
            )}
          </div>
        </>
      )}

      <DisappearingMessagesDialog
        open={isDisappearingDialogOpen}
        onOpenChange={setIsDisappearingDialogOpen}
        onConfirm={(duration) => {
          console.log('Set duration:', duration)
          setIsDisappearingDialogOpen(false)
        }}
      />

      {isShareLinkOpen && conversation.joinLinkToken && (
        <ForwardDialog
          open
          onClose={() => setIsShareLinkOpen(false)}
          title='Chia sẻ'
          confirmText='Chia sẻ'
          onConfirm={(selectedConvIds) => {
            const linkUrl = `${window.location.origin}/g/${conversation.joinLinkToken}`
            selectedConvIds.forEach((convId) => {
              sendMessage(convId, linkUrl, null, false)
            })
          }}
        />
      )}

      {isCreateGroupOpen && (
        <CreateGroupDialog
          isOpen={isCreateGroupOpen}
          onClose={() => setIsCreateGroupOpen(false)}
          initialSelectedFriendIds={[]}
        />
      )}

      {isAddMemberOpen && (
        <CreateGroupDialog
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          conversationId={conversation.id}
        />
      )}

      <LeaveGroupDialog
        open={isLeaveGroupDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsLeaveGroupDialogOpen(nextOpen)
          if (!nextOpen) setPendingTransferTargetId(null)
        }}
        conversationId={conversation.id}
        transferTargetUserId={pendingTransferTargetId}
      />

      <TransferOwnerDialog
        open={isTransferOwnerDialogOpen}
        onOpenChange={setIsTransferOwnerDialogOpen}
        members={conversation.members || []}
        currentUserId={user?.id}
        onSelect={(targetUserId) => {
          setPendingTransferTargetId(targetUserId)
          setIsLeaveGroupDialogOpen(true)
        }}
      />
    </div>
  )
}
