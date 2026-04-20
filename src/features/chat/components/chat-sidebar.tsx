import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { chatKeys } from '../queries/keys'
import { UserPlus, Users, Filter, MoreHorizontal, Megaphone, Trash2, Clock3, FolderTree, BellOff, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConversationsQuery } from '../queries/use-queries'
import { useAuth } from '@/features/auth'
import { MessageType, MessageStatus } from '@/constants/enum'
import { useChatText } from '../i18n/use-chat-text'
import { CreateGroupDialog } from './group/dialogs/create-group-dialog'
import { GroupAvatar } from '@/components/common/group-avatar'
import { UserAvatar } from '@/components/common/user-avatar'
import type { ConversationResponse } from '../schemas/chat.schema'
import { formatPreview } from '../utils/chat-preview'
import { getSystemMessagePreviewDisplay } from '../utils/system-message-preview'
import { formatMessageTime } from '@/utils/date'
import { getConversationDisplayName } from '../utils/group-name'
import { stripMentionsForPreview } from '../utils/mention'
import { SearchAndActions, type SearchAction } from '@/components/common/search-and-actions'
import { AddFriendSearchDialog } from '@/features/friend'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useClearConversationHistoryMutation, useDeleteConversationMutation } from '../queries/use-mutations'
import { ConversationHistoryConfirmDialog } from './conversation-history-confirm-dialog'
import { showSimpleToast } from '@/utils/toast'
import { BONDHUB_AI } from '@/constants/system'

interface ChatSidebarProps {
  selectedChatId?: string
  onSelectChat: (chat: ConversationResponse, snapshotId?: string | null, unreadCount?: number) => void
}

export function ChatSidebar({ selectedChatId, onSelectChat }: ChatSidebarProps) {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false)
  const [clearTarget, setClearTarget] = useState<ConversationResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ConversationResponse | null>(null)
  const { text, t, i18n } = useChatText()
  const { user } = useAuth()
  const { data: conversations, isLoading, isError } = useConversationsQuery()
  const queryClient = useQueryClient()

  const isAiConversation = (chat: ConversationResponse) => {
    return chat.members?.some((member) => member.userId === BONDHUB_AI.userId) ?? false
  }

  const getEffectiveUnreadCount = (chat: ConversationResponse) => {
    if (isAiConversation(chat)) return 0
    return chat.unreadCount ?? 0
  }
  const { mutate: clearHistory, isPending: isClearing } = useClearConversationHistoryMutation()
  const { mutate: deleteConversation, isPending: isDeleting } = useDeleteConversationMutation()

  const handleSelectChat = (chat: ConversationResponse) => {
    const unreadCount = getEffectiveUnreadCount(chat)
    console.log(`[ChatSidebar] Selecting chat: ${chat.id}, unreadCount: ${unreadCount}`)

    let capturedSnapshotId: string | null = null
    if (unreadCount > 0) {
      const myMember = chat.members?.find((m) => m.userId === user?.id)
      capturedSnapshotId = myMember?.lastReadMessageId || null
      console.log(`[ChatSidebar] Snapshot captured before markAsRead: ${capturedSnapshotId}`)
    }

    onSelectChat(chat, capturedSnapshotId, unreadCount)

    if (unreadCount > 0) {
      markAsRead({ conversationId: chat.id, lastReadMessageId: chat.lastMessage?.id || undefined })
    }
  }

  const getPreviewDisplay = (chat: ConversationResponse) => {
    if (!chat.lastMessage) return { text: '', showPromoteTargetIcon: false }

    if (chat.lastMessage.type === MessageType.System) {
      return getSystemMessagePreviewDisplay(
        chat.lastMessage.metadata,
        chat.lastMessage.senderId || undefined,
        chat.lastMessage.senderName || undefined,
        user?.id,
        chat.members || [],
        t
      )
    }

    return {
      text: formatPreview(
        {
          content: stripMentionsForPreview(chat.lastMessage.content),
          isFromMe: !!chat.lastMessage.isFromMe,
          senderName: chat.lastMessage.senderName || '',
          type: chat.lastMessage.type as MessageType,
          status: chat.lastMessage.status as MessageStatus
        },
        text
      ),
      showPromoteTargetIcon: false
    }
  }

  const headerActions: SearchAction[] = [
    {
      icon: UserPlus,
      onClick: () => setIsAddFriendModalOpen(true),
      title: text.sidebar.addFriend
    },
    {
      icon: Users,
      onClick: () => setIsCreateGroupModalOpen(true),
      title: text.sidebar.createGroup
    }
  ]

  return (
    <div className='w-[344px] flex flex-col border-r border-border bg-background shrink-0 h-full'>
      {/* Search and Quick Actions */}
      <div className='px-4 py-3 shrink-0'>
        <SearchAndActions placeholder={text.searchPlaceholder} actions={headerActions} />
      </div>

      {/* Filters Bar */}
      <div className='px-4 flex items-center justify-between border-b border-muted shrink-0'>
        <div className='flex items-center h-10'>
          <button className='h-full px-2 text-sm font-semibold text-primary border-b-2 border-primary'>
            {text.sidebar.all}
          </button>
          <button className='h-full px-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-all ml-2'>
            {text.sidebar.unread}
          </button>
        </div>
        <div className='flex items-center gap-1'>
          <button className='flex items-center gap-1 px-2 py-1 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors'>
            {text.sidebar.category}
            <Filter className='w-3 h-3' />
          </button>
          <button className='p-1.5 hover:bg-muted rounded-full text-text-secondary hover:text-text-primary transition-colors'>
            <MoreHorizontal className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className='flex-1 overflow-y-auto custom-scrollbar divide-y divide-muted/30'>
        {isLoading && <div className='p-4 text-center text-text-secondary text-sm'>{text.loading}</div>}
        {isError && <div className='p-4 text-center text-destructive text-sm'>{text.errors.loadConversations}</div>}

        {conversations?.map((chat: ConversationResponse) => {
          const previewDisplay = getPreviewDisplay(chat)
          const isSelected = selectedChatId === chat.id
          const effectiveUnreadCount = getEffectiveUnreadCount(chat)

          return (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={cn(
                'flex items-center h-[78px] px-4 cursor-pointer transition-colors group relative',
                isSelected ? 'bg-layer-selected' : 'hover:bg-muted/40'
              )}
            >
              <div className='relative shrink-0'>
                {chat.isGroup && !chat.avatar ? (
                  <GroupAvatar
                    avatars={chat.members?.map((m) => m.avatar) || []}
                    names={chat.members?.map((m) => m.fullName) || []}
                    count={chat.members?.length || 0}
                    size='lg'
                  />
                ) : (
                  <UserAvatar
                    src={chat.avatar}
                    name={getConversationDisplayName(chat, 'User', undefined, user?.id)}
                    className='w-[52px] h-[52px]'
                  />
                )}
                {chat.status === 'ONLINE' && !chat.isGroup && (
                  <div className='absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-background rounded-full' />
                )}
              </div>

              <div className='ml-3 flex-1 min-w-0 flex flex-col justify-center h-full'>
                <div className='flex items-center justify-between'>
                  <h3
                    className={cn(
                      'text-base truncate text-text-primary',
                      chat.unreadCount && chat.unreadCount > 0 ? 'font-semibold' : 'font-normal'
                    )}
                  >
                    {getConversationDisplayName(chat, 'Group', undefined, user?.id)}
                  </h3>
                  <span
                    className={cn(
                      'text-xs text-text-secondary whitespace-nowrap ml-2',
                      effectiveUnreadCount > 0 ? 'font-semibold' : 'font-normal'
                    )}
                  >
                    {chat.lastMessage?.timestamp ? formatMessageTime(chat.lastMessage.timestamp, i18n.language) : ''}
                  </span>
                </div>

                <div className='flex items-center justify-between mt-0.5'>
                  <p
                    className={cn(
                      'text-sm flex items-center gap-1 min-w-0 pr-4 truncate',
                      effectiveUnreadCount > 0 ? 'text-text-primary font-medium' : 'text-text-secondary font-normal'
                    )}
                  >
                    {previewDisplay.showPromoteTargetIcon && (
                      <Megaphone className='w-3.5 h-3.5 shrink-0 text-orange-500' />
                    )}
                    <span className='truncate'>{previewDisplay.text}</span>
                  </p>

                  {effectiveUnreadCount > 0 && (
                    <div className='flex items-center gap-1 shrink-0'>
                      {(() => {
                        const meta = chat.lastMessage?.metadata as Record<string, unknown> | null
                        const mentions = meta?.mentions as string[] | undefined
                        const isMentioned = mentions?.includes(user?.id || '')
                        const isSystem = chat.lastMessage?.type === MessageType.System
                        const isNegativeSysAction = meta?.action === 'DISBAND_GROUP'

                        return (
                          <>
                            {isMentioned && (
                              <div className='bg-primary text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center'>
                                @
                              </div>
                            )}
                            {!isSystem && (
                              <div className='bg-destructive text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center'>
                                {effectiveUnreadCount > 5 ? '5+' : effectiveUnreadCount}
                              </div>
                            )}
                            {isSystem && !isNegativeSysAction && (
                              <div className='w-2 h-2 bg-destructive rounded-full mr-1' />
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Hover Actions */}
              <div className='absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded-md p-0.5 shadow-sm border border-border/40'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className='p-1.5 hover:bg-muted rounded transition-colors'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className='w-4 h-4 text-text-secondary' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-56 rounded-xl'>
                    <DropdownMenuItem className='text-[14px]' onClick={(e) => e.preventDefault()}>
                      Ghim hội thoại
                    </DropdownMenuItem>
                    <DropdownMenuItem className='text-[14px]' onClick={(e) => e.preventDefault()}>
                      <FolderTree className='w-4 h-4 mr-2' />
                      Phân loại
                    </DropdownMenuItem>
                    <DropdownMenuItem className='text-[14px]' onClick={(e) => e.preventDefault()}>
                      Đánh dấu chưa đọc
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='text-[14px]' onClick={(e) => e.preventDefault()}>
                      <Users className='w-4 h-4 mr-2' />
                      Thêm vào nhóm
                    </DropdownMenuItem>
                    <DropdownMenuItem className='text-[14px]' onClick={(e) => e.preventDefault()}>
                      <BellOff className='w-4 h-4 mr-2' />
                      Tắt thông báo
                    </DropdownMenuItem>
                    <DropdownMenuItem className='text-[14px]' onClick={(e) => e.preventDefault()}>
                      <Clock3 className='w-4 h-4 mr-2' />
                      Tin nhắn tự xóa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className='text-[14px]'
                      onClick={(e) => {
                        e.preventDefault()
                        setClearTarget(chat)
                      }}
                    >
                      <Trash2 className='w-4 h-4 mr-2' />
                      Xóa lịch sử chat
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-[14px] text-destructive focus:text-destructive'
                      onClick={(e) => {
                        e.preventDefault()
                        setDeleteTarget(chat)
                      }}
                    >
                      <Trash2 className='w-4 h-4 mr-2' />
                      Xóa hội thoại
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='text-[14px]' onClick={(e) => e.preventDefault()}>
                      <Flag className='w-4 h-4 mr-2' />
                      Báo xấu
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })}
      </div>

      <ConversationHistoryConfirmDialog
        open={!!clearTarget}
        onOpenChange={(open) => {
          if (!open) setClearTarget(null)
        }}
        title='Xóa lịch sử chat'
        description={`Bạn có chắc muốn xóa lịch sử chat với ${clearTarget ? getConversationDisplayName(clearTarget, 'Người dùng', undefined, user?.id) : ''}?`}
        confirmLabel='Xóa'
        cancelLabel='Hủy'
        isPending={isClearing}
        onConfirm={() => {
          if (!clearTarget) return
          clearHistory(clearTarget.id, {
            onSuccess: () => {
              showSimpleToast('Đã xóa lịch sử chat')
              setClearTarget(null)
            }
          })
        }}
      />

      <ConversationHistoryConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title='Xóa hội thoại'
        description='Bạn sẽ không còn thấy hội thoại này trong danh sách. Hành động này chỉ áp dụng với tài khoản của bạn.'
        confirmLabel='Xóa hội thoại'
        cancelLabel='Hủy'
        isPending={isDeleting}
        destructive
        onConfirm={() => {
          if (!deleteTarget) return
          const deletedId = deleteTarget.id
          deleteConversation(deletedId, {
            onSuccess: () => {
              showSimpleToast('Đã xóa hội thoại')
              setDeleteTarget(null)
              if (selectedChatId === deletedId) {
                queryClient.removeQueries({ queryKey: chatKeys.messages(deletedId) })
              }
            }
          })
        }}
      />

      <CreateGroupDialog isOpen={isCreateGroupModalOpen} onClose={() => setIsCreateGroupModalOpen(false)} />
      <AddFriendSearchDialog open={isAddFriendModalOpen} onOpenChange={setIsAddFriendModalOpen} />
    </div>
  )
}
