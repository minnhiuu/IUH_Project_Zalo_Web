import { Trash2, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { UserAvatar } from '@/components/common/user-avatar'
import { GroupAvatar } from './group/group-avatar'
import { ActionMenuItem } from '@/components/common/action-menu-item'
import type { ConversationResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'
import { useAuth } from '@/features/auth'
import { DisappearingMessagesDialog } from '@/components/common/disappearing-messages-dialog'
import { CreateGroupDialog } from './group/create-group-dialog'
import { GroupManagementStep } from './group/group-management-step'
import { GroupMembersStep } from './group/group-members-step'
import { ChatInfoTopSection } from './chat-info-top-section'
import { ChatInfoSections } from './chat-info-sections'
import { cn } from '@/lib/utils'
import { useDeleteConversationMutation } from '../queries/use-mutations'
import { GroupMemberRole } from '@/constants/enum'

interface ChatInfoSidebarProps {
  conversation: ConversationResponse
  onRenameClick?: () => void
  onAvatarClick?: () => void
  onManagementClick?: () => void
}

export function ChatInfoSidebar({ conversation, onRenameClick, onAvatarClick }: ChatInfoSidebarProps) {
  const isGroup = conversation.isGroup
  const { text: tg } = useChatText()
  const { user } = useAuth()
  const { mutate: deleteConversation } = useDeleteConversationMutation()
  const [step, setStep] = useState<'info' | 'management' | 'members'>('info')
  const [isDisappearingDialogOpen, setIsDisappearingDialogOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const isOverlayDialogOpen = isCreateGroupOpen || isAddMemberOpen

  const currentMember = conversation.members?.find((m) => m.userId === user?.id)
  const isMemberOnly = isGroup && currentMember?.role?.toUpperCase() === 'MEMBER'
  const currentUserRole = (currentMember?.role?.toUpperCase() as GroupMemberRole) || GroupMemberRole.Member
  const otherMembers = conversation.members?.filter((m) => m.userId !== user?.id) || []
  const initialSelectedFriendIds = !isGroup ? otherMembers.map((m) => m.userId) : []

  if (step === 'management' || step === 'members') {
    return (
      <div
        className={cn(
          'w-[350px] border-l border-border bg-background flex flex-col h-full overflow-hidden shrink-0 shadow-xl min-[1150px]:shadow-none min-[1150px]:relative absolute right-0 top-0',
          isOverlayDialogOpen ? 'z-40' : 'z-100'
        )}
      >
        {/* Header */}
        <div className='h-[68px] flex items-center border-b border-border shrink-0 px-4'>
          <button
            onClick={() => setStep('info')}
            className='p-1 -ml-1 hover:bg-muted rounded-full transition-colors outline-none cursor-pointer shrink-0'
          >
            <ArrowLeft className='w-5 h-5 text-foreground' />
          </button>
          <h2 className='font-bold text-[16px] text-foreground flex-1 text-center pr-6'>
            {step === 'management' ? tg['group-info-dialog'].managementTitle : tg.sidebarInfo.members}
          </h2>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-hidden'>
          {step === 'management' ? (
            <GroupManagementStep
              text={tg['group-info-dialog']}
              conversationId={conversation.id}
              onDisbandSuccess={() => setStep('info')}
            />
          ) : (
            <GroupMembersStep
              conversationId={conversation.id}
              membersTitle={tg.sidebarInfo.members}
              membersCount={conversation.members?.length || 0}
              addMemberLabel={tg.sidebarInfo.addMember}
              addFriendLabel={tg.sidebar.addFriend}
              currentUserRole={currentUserRole}
              onOpenAddMember={() => setIsAddMemberOpen(true)}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-[350px] border-l border-border bg-background flex flex-col h-full overflow-hidden shrink-0 shadow-xl min-[1150px]:shadow-none min-[1150px]:relative absolute right-0 top-0',
        isOverlayDialogOpen ? 'z-40' : 'z-100'
      )}
    >
      {/* Header */}
      <div className='h-[68px] flex items-center justify-center border-b border-border shrink-0 px-4'>
        <h2 className='font-bold text-[16px] text-foreground'>
          {isGroup ? tg.sidebarInfo.groupTitle : tg.sidebarInfo.title}
        </h2>
      </div>

      {/* Main Content */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-background'>
        {conversation.isDisbanded ? (
          <div className='flex flex-col h-full bg-background'>
            {/* Top Profile Info */}
            <div className='flex flex-col items-center p-6 pb-4'>
              <div className='relative mb-4'>
                {isGroup && !conversation.avatar ? (
                  <GroupAvatar
                    avatars={conversation.members?.map((m) => m.avatar) || []}
                    names={conversation.members?.map((m) => m.fullName) || []}
                    count={conversation.members?.length || 0}
                    size='xl'
                  />
                ) : (
                  <UserAvatar
                    src={conversation.avatar}
                    name={conversation.name || tg.user}
                    className='w-24 h-24 shadow-md'
                  />
                )}
              </div>
              <h3 className='font-bold text-[20px] text-foreground text-center mb-1'>{conversation.name}</h3>
              <p className='text-muted-foreground text-[14px] text-center px-4 mb-2'>{tg.disbanded.message}</p>
            </div>

            {/* Thick Divider & Action */}
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

            <div className='h-[8px] bg-secondary' />
          </div>
        ) : (
          <>
            <ChatInfoTopSection
              conversation={conversation}
              isGroup={isGroup}
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
              onOpenManagement={() => setStep('management')}
            />

            <div className='h-[8px] bg-secondary' />
            <ChatInfoSections
              isGroup={isGroup}
              isMemberOnly={isMemberOnly}
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
                viewAll: tg.sidebarInfo.viewAll
              }}
              membersCountLabel={tg.status.membersCount(conversation.members?.length || 0)}
              onOpenMembers={() => setStep('members')}
              onOpenDisappearingDialog={() => setIsDisappearingDialogOpen(true)}
            />
          </>
        )}
      </div>

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

      {isAddMemberOpen && (
        <CreateGroupDialog
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          conversationId={conversation.id}
        />
      )}
    </div>
  )
}
