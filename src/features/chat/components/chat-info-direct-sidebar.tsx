import { useState, useMemo } from 'react'
import { DisappearingMessagesDialog } from '@/components/common/disappearing-messages-dialog'
import { CreateGroupDialog } from './group/dialogs/create-group-dialog'
import { ChatInfoTopSection } from './chat-info-top-section'
import { ChatInfoSections } from './chat-info-sections'
import { MediaStorageView } from './media-storage-view'
import { cn } from '@/lib/utils'
import type { ConversationResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'
import { useAuth } from '@/features/auth'

interface ChatInfoDirectSidebarProps {
  conversation: ConversationResponse
  onRenameClick?: () => void
  onAvatarClick?: () => void
}

export function ChatInfoDirectSidebar({ conversation, onRenameClick, onAvatarClick }: ChatInfoDirectSidebarProps) {
  const { text: tg } = useChatText()
  const { user } = useAuth()
  const [isDisappearingDialogOpen, setIsDisappearingDialogOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [storageOpen, setStorageOpen] = useState(false)
  const [storageTab, setStorageTab] = useState<'media' | 'files' | 'links'>('media')

  const otherMembers = conversation.members?.filter((m) => m.userId !== user?.id) || []
  const initialSelectedFriendIds = otherMembers.map((m) => m.userId)

  // Đảm bảo cả mình lẫn đối phương đều xuất hiện trong bộ lọc "Người gửi"
  const allMembersForFilter = useMemo(() => {
    const list = conversation.members || []
    const hasSelf = list.some((m) => m.userId === user?.id)
    if (hasSelf || !user) return list
    return [{ userId: user.id, fullName: `${user.fullName} (Bạn)`, avatar: user.avatar ?? null, role: null }, ...list]
  }, [conversation.members, user])

  return (
    <div
      className={cn(
        'w-full border-l border-border bg-background flex flex-col h-full overflow-hidden shrink-0 shadow-xl min-[1150px]:shadow-none'
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
          <div className='h-[68px] flex items-center justify-center border-b border-border shrink-0 px-4'>
            <h2 className='font-bold text-[16px] text-foreground'>{tg.sidebarInfo.title}</h2>
          </div>

          <div className='flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-background'>
            <ChatInfoTopSection
              conversation={conversation}
              isGroup={false}
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
              onOpenAddMember={() => {}}
              onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
              onOpenManagement={() => {}}
            />

            <div className='h-[8px] bg-secondary' />
            <ChatInfoSections
              isGroup={false}
              isMemberOnly={false}
              conversationId={conversation.id}
              members={conversation.members}
              text={{
                members: tg.sidebarInfo.members,
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
                viewAll: tg.sidebarInfo.viewAll,
                pendingJoinRequestsLabel: tg.sidebarInfo.pendingJoinRequestsLabel
              }}
              membersCountLabel={tg.status.membersCount(conversation.members?.length || 0)}
              onOpenMembers={() => {}}
              onOpenDisappearingDialog={() => setIsDisappearingDialogOpen(true)}
              onLeaveGroup={() => {}}
              onOpenStorage={(tab) => {
                setStorageTab(tab)
                setStorageOpen(true)
              }}
            />
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

      {isCreateGroupOpen && (
        <CreateGroupDialog
          isOpen={isCreateGroupOpen}
          onClose={() => setIsCreateGroupOpen(false)}
          initialSelectedFriendIds={initialSelectedFriendIds}
        />
      )}
    </div>
  )
}
