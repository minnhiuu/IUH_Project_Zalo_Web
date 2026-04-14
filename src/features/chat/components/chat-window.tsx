import { Phone, Video, Search, PanelsTopLeft, Users, Pencil } from 'lucide-react'
import { useMessagesInfiniteQuery } from '../queries/use-queries'
import { useAuth } from '@/features/auth'
import { useChatContext } from '../context/chat-context'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'
import { ChatInputRestricted } from './chat-input-restricted'
import { useChatScroll } from '../hooks/use-chat-scroll'
import { useChatText } from '../i18n/use-chat-text'
import { VideoCallRoom, IncomingCallDialog, OutgoingCallScreen, useVideoCall } from './call-video/video-call'
import { useCallNotification } from '../hooks/use-call-notification'
import { rejectCallApi } from '../api/call.api'
import {
  useMarkAsReadMutation,
  useUpdateGroupNameMutation,
  useUpdateGroupAvatarMutation
} from '../queries/use-mutations'
import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { ConversationResponse, MessageResponse } from '../schemas/chat.schema'
import { ForwardDialog } from './forward-dialog'
import { formatLastSeen } from '@/utils/date'
import { CloudInfoSidebar } from './cloud-info-sidebar'
import { AiChatWindow } from './ai-chat-window'
import { ChatInfoSidebar } from './chat-info-sidebar'
import { UserAvatar } from '@/components/common/user-avatar'
import { ActionButton } from '@/components/common/action-button'
import { GroupAvatar } from './group/group-avatar'
import { ImageCropperDialog } from '@/components/common/image-cropper-dialog'
import { getCroppedImg } from '@/utils/image-crop'
import { cn } from '@/lib/utils'
import { GroupIntroCard } from './group/cards/group-intro-card'
import { getConversationDisplayName } from '../utils/group-name'
import { GroupInfoDialog } from './group/dialogs/group-info-dialog'
import { RenameGroupDialog } from './group/dialogs/rename-group-dialog'
import { showLoadingToast, showSuccessToast, showErrorToast, showWarningToast } from '@/utils/toast'
import { toast } from 'sonner'
import { StrangerBanner } from './stranger-banner'
import { OthersProfileDialog } from '@/features/user/components/profile-dialog/others/others-profile-dialog'
import { OwnerProfileDialog } from '@/features/user/components/profile-dialog/owner/owner-profile-dialog'
import { canSendMessages, canChangeGroupInfo } from '../utils/group-permissions'
import { PinBoard } from './pin-board'
import { TypingIndicator } from './typing-indicator'

const OPEN_GROUP_MANAGEMENT_EVENT = 'chat:open-group-management'
const OPEN_GROUP_INFO_EVENT = 'chat:open-group-info'

export function ChatWindow({ conversation }: { conversation: ConversationResponse }) {
  const { user } = useAuth()
  const { sendMessage, typingUsers } = useChatContext()
  const { t, text } = useChatText()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMessagesInfiniteQuery(conversation.id)

  const { scrollRef, handleScroll } = useChatScroll({ fetchNextPage, hasNextPage, isFetchingNextPage })
  const { mutate: markAsRead } = useMarkAsReadMutation()
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const lastReadSentId = useRef<string | null>(null)

  const scrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('highlight-message')
    setTimeout(() => el.classList.remove('highlight-message'), 1200)
  }, [])

  const [replyTo, setReplyTo] = useState<MessageResponse | null>(null)
  const [forwardingMessage, setForwardingMessage] = useState<MessageResponse | null>(null)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false)
  const [infoDialogStep, setInfoDialogStep] = useState<'info' | 'management'>('info')
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(window.innerWidth >= 1150)
  const [managementOpenSignal, setManagementOpenSignal] = useState(0)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isOwnerProfileOpen, setIsOwnerProfileOpen] = useState(false)
  const [profileUserId, setProfileUserId] = useState<string | undefined>(undefined)

  // Video Call
  const { callState, startCall, connectCall, cancelOutgoing, handleIncomingCall, acceptIncoming, rejectIncoming, endCall } = useVideoCall()
  const [isCallLoading, setIsCallLoading] = useState(false)

  useCallNotification({ onIncomingCall: handleIncomingCall })

  const handleStartVideoCall = async () => {
    if (!partnerId || isGroup || isCloudConversation) return
    setIsCallLoading(true)
    try {
      await startCall(partnerId)
    } catch (error: any) {
      const code = error?.response?.data?.code
      if (code === 5001) {
        showWarningToast(t('call.busy'))
      } else if (code === 5004) {
        showWarningToast(t('call.already_in_call'))
      } else {
        showErrorToast(t('call.error'))
      }
    } finally {
      setIsCallLoading(false)
    }
  }

  const handleRejectIncoming = async () => {
    if (callState.incoming) {
      try {
        await rejectCallApi(callState.incoming.sessionId)
      } catch { /* ignore */ }
    }
    rejectIncoming()
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1150) {
        setIsInfoSidebarOpen(false)
      } else {
        setIsInfoSidebarOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleOpenManagement = (event: Event) => {
      const customEvent = event as CustomEvent<{ conversationId?: string }>
      if (customEvent.detail?.conversationId !== conversation.id) return
      setIsInfoSidebarOpen(true)
      setManagementOpenSignal((v) => v + 1)
    }

    window.addEventListener(OPEN_GROUP_MANAGEMENT_EVENT, handleOpenManagement as EventListener)
    return () => window.removeEventListener(OPEN_GROUP_MANAGEMENT_EVENT, handleOpenManagement as EventListener)
  }, [conversation.id])

  useEffect(() => {
    const handleOpenInfo = (event: Event) => {
      const customEvent = event as CustomEvent<{ conversationId?: string }>
      if (customEvent.detail?.conversationId !== conversation.id) return
      setIsInfoSidebarOpen(true)
    }

    window.addEventListener(OPEN_GROUP_INFO_EVENT, handleOpenInfo as EventListener)
    return () => window.removeEventListener(OPEN_GROUP_INFO_EVENT, handleOpenInfo as EventListener)
  }, [conversation.id])
  const { mutate: updateGroupName, isPending: isUpdatingName } = useUpdateGroupNameMutation()
  const { mutate: updateGroupAvatar } = useUpdateGroupAvatarMutation()

  const [selectedImage, setSelectedImage] = useState<{ url: string; file: File } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setSelectedImage({ url: reader.result as string, file })
      reader.readAsDataURL(file)
      e.target.value = ''
    }
  }

  const triggerFileInput = () => fileInputRef.current?.click()

  const handleCropConfirm = async (data: { pixels: { x: number; y: number; width: number; height: number } }) => {
    if (!selectedImage) return

    const toastId = showLoadingToast(text.toasts.updating)

    try {
      const croppedBlob = await getCroppedImg(selectedImage.url, data.pixels)
      if (croppedBlob) {
        const croppedFile = new File([croppedBlob], 'group-avatar.jpg', { type: 'image/jpeg' })
        updateGroupAvatar(
          { id: conversation.id, file: croppedFile },
          {
            onSuccess: () => {
              toast.dismiss(toastId)
              showSuccessToast(text.toasts.updateAvatarSuccess)
            },
            onError: () => {
              toast.dismiss(toastId)
              showErrorToast(text.toasts.updateError)
            }
          }
        )
      } else {
        toast.dismiss(toastId)
      }
      setSelectedImage(null)
    } catch (err) {
      console.error('Crop failed', err)
      toast.dismiss(toastId)
      showErrorToast(text.toasts.updateError)
      setSelectedImage(null)
    }
  }

  const handleRename = (newName: string) => {
    const toastId = showLoadingToast(text.toasts.updating)
    updateGroupName(
      { id: conversation.id, name: newName },
      {
        onSuccess: () => {
          toast.dismiss(toastId)
          setIsRenameDialogOpen(false)
          showSuccessToast(text.toasts.updateNameSuccess)
        },
        onError: () => {
          toast.dismiss(toastId)
          showErrorToast(text.toasts.updateError)
        }
      }
    )
  }

  const allMessages = useMemo(() => data?.pages.flatMap((page) => page.data) || [], [data])

  const latestMessageId = allMessages[0]?.id
  const latestMessageSenderId = allMessages[0]?.senderId

  const isCloudConversation =
    !conversation.isGroup && (conversation.name === 'My Documents' || (conversation.avatar ?? '').includes('cloud.png'))
  const isAiConversation = conversation.members?.some((m) => m.userId === 'ai-assistant-001') ?? false
  const isCurrentUserRemovedBySystemMessage = useMemo(() => {
    if (!conversation.isGroup || !user?.id) return false

    for (const msg of allMessages) {
      if (msg.type !== 'SYSTEM' || !msg.metadata) continue

      const metadata = msg.metadata as { action?: string; targetIds?: string[] }
      const targetIds = Array.isArray(metadata.targetIds) ? metadata.targetIds.map(String) : []
      const includesMe = targetIds.includes(String(user.id))

      if ((metadata.action === 'REMOVE_MEMBER' || metadata.action === 'BLOCK_MEMBER') && includesMe) return true
      if (metadata.action === 'LEAVE_GROUP' && String(msg.senderId || '') === String(user.id)) return true
      if (
        (metadata.action === 'ADD_MEMBERS' ||
          metadata.action === 'CREATE_GROUP' ||
          metadata.action === 'JOIN_REQUEST_APPROVED') &&
        includesMe
      )
        return false
      if (metadata.action === 'JOIN_BY_LINK' && String(msg.senderId || '') === String(user.id)) return false
    }

    return false
  }, [allMessages, conversation.isGroup, user?.id])
  const isCurrentUserRemovedFromGroup =
    conversation.isGroup &&
    !conversation.isDisbanded &&
    (!(conversation.members || []).some((m) => m.userId === user?.id) || isCurrentUserRemovedBySystemMessage)
  const isGroup = conversation.isGroup || false
  const partnerId = conversation.recipientId || conversation.members?.find((m) => m.userId !== user?.id)?.userId

  useEffect(() => {
    if (isCurrentUserRemovedFromGroup) return
    if (!latestMessageId || !conversation.id || conversation.unreadCount === 0) return
    if (latestMessageSenderId === user?.id) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && document.visibilityState === 'visible') {
          if (lastReadSentId.current === latestMessageId) return
          lastReadSentId.current = latestMessageId
          markAsRead(conversation.id)
        }
      },
      { threshold: 0.5 }
    )

    const currentRef = lastMessageRef.current
    if (currentRef) observer.observe(currentRef)
    return () => {
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [
    isCurrentUserRemovedFromGroup,
    latestMessageId,
    latestMessageSenderId,
    conversation.id,
    conversation.unreadCount,
    markAsRead,
    user?.id
  ])

  const isSameGroup = (msg1: MessageResponse, msg2: MessageResponse) => {
    if (!msg1 || !msg2) return false
    if (msg1.type === 'SYSTEM' || msg2.type === 'SYSTEM') return false
    if (msg1.senderId !== msg2.senderId) return false
    const time1 = new Date(msg1.createdAt || '').getTime()
    const time2 = new Date(msg2.createdAt || '').getTime()
    const diffMinutes = Math.abs(time1 - time2) / (1000 * 60)
    return diffMinutes < 5
  }

  if (isAiConversation) {
    return (
      <div className='flex-1 flex h-full overflow-hidden'>
        <AiChatWindow conversation={conversation} />
      </div>
    )
  }

  return (
    <div className='flex-1 flex h-full overflow-hidden'>
      <div className='flex-1 flex flex-col bg-[#eef0f1] dark:bg-zinc-950 relative overflow-hidden h-full'>
        <div className='h-[68px] border-b border-border bg-background flex items-center justify-between px-4 shrink-0 shadow-sm z-10'>
          <div
            className={cn(
              'flex items-center space-x-3 min-w-0 flex-1',
              !isGroup &&
                !isCloudConversation &&
                'cursor-pointer hover:bg-black/5 p-1.5 -ml-1.5 rounded-lg transition-colors'
            )}
            onClick={() => {
              if (!isGroup && !isCloudConversation) {
                setIsProfileOpen(true)
              }
            }}
          >
            <div className='relative shrink-0 hidden sm:block'>
              <input type='file' ref={fileInputRef} onChange={handleAvatarChange} accept='image/*' className='hidden' />
              <div
                onClick={
                  conversation.isGroup && !isAiConversation
                    ? (e: React.MouseEvent) => {
                        e.stopPropagation()
                        setInfoDialogStep('info')
                        setIsInfoDialogOpen(true)
                      }
                    : undefined
                }
                className={cn(
                  'relative rounded-full transition-all shrink-0',
                  conversation.isGroup && !isAiConversation && 'cursor-pointer hover:ring-2 hover:ring-primary/20'
                )}
              >
                {conversation.isGroup && !conversation.avatar ? (
                  <GroupAvatar
                    avatars={conversation.members?.map((m) => m.avatar) || []}
                    names={conversation.members?.map((m) => m.fullName) || []}
                    count={conversation.members?.length || 0}
                    size='lg'
                  />
                ) : (
                  <UserAvatar
                    src={conversation.avatar}
                    name={getConversationDisplayName(conversation, 'User', undefined, user?.id)}
                    className='w-10 h-10'
                  />
                )}
              </div>
              {conversation.status === 'ONLINE' && !conversation.isGroup && (
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full' />
              )}
            </div>
            <div className='min-w-0 flex-1 group/header'>
              <div
                role='button'
                aria-disabled={
                  !conversation.isGroup || isCloudConversation || !canChangeGroupInfo(conversation, user?.id || '')
                }
                onClick={(e) => {
                  if (
                    conversation.isGroup &&
                    !isCloudConversation &&
                    canChangeGroupInfo(conversation, user?.id || '')
                  ) {
                    e.stopPropagation()
                    setIsRenameDialogOpen(true)
                  }
                }}
                className={cn(
                  'flex items-center gap-1.5 max-w-full group/btn text-left',
                  conversation.isGroup && !isCloudConversation && canChangeGroupInfo(conversation, user?.id || '')
                    ? 'cursor-pointer'
                    : 'cursor-default'
                )}
              >
                <h2 className='text-[16px] font-semibold text-foreground/90 leading-tight overflow-hidden whitespace-nowrap truncate'>
                  {isCloudConversation
                    ? 'My Documents'
                    : getConversationDisplayName(conversation, 'Group', undefined, user?.id)}
                </h2>
                {conversation.isGroup && !isCloudConversation && canChangeGroupInfo(conversation, user?.id || '') && (
                  <div className='opacity-0 group-hover/header:opacity-100 transition-all shrink-0 ml-1'>
                    <ActionButton icon={<Pencil />} size='sm' iconSize='sm' />
                  </div>
                )}
              </div>
              <p className='text-[12px] text-muted-foreground mt-0.5 leading-tight flex items-center gap-1 overflow-hidden whitespace-nowrap'>
                {isCloudConversation ? (
                  'Lưu và đồng bộ dữ liệu giữa các thiết bị'
                ) : conversation.isGroup ? (
                  <span className='flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors'>
                    <Users className='w-4 h-4' />
                    {text.status.membersCount(conversation.members?.length || 0)}
                  </span>
                ) : !isGroup && (!conversation.friendshipStatus || conversation.friendshipStatus !== 'ACCEPTED') ? (
                  <span className='flex items-center space-x-2'>
                    <span className='bg-[#A6AAB1] text-white text-[10px] font-semibold px-1.5 py-[1px] rounded-[3px] uppercase tracking-wide'>
                      Người lạ
                    </span>
                    <span className='text-muted-foreground'>|</span>
                    <span className='flex items-center text-[12px] text-muted-foreground gap-1 font-medium'>
                      <Users className='w-3.5 h-3.5' />
                      <span>Nhóm chung (0)</span>
                    </span>
                  </span>
                ) : conversation.status === 'ONLINE' ? (
                  text.status.online
                ) : (
                  formatLastSeen(conversation.lastSeenAt, text.status)
                )}
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-1 sm:space-x-2 text-muted-foreground'>
            <button
              onClick={handleStartVideoCall}
              disabled={isCallLoading || isGroup || isCloudConversation || callState.phase !== 'idle'}
              className='p-2 hover:bg-muted rounded-full transition-colors hidden sm:block disabled:opacity-40 disabled:cursor-not-allowed'
              title='Gọi thoại'
            >
              <Phone className='w-[18px] h-[18px]' />
            </button>
            <button
              onClick={handleStartVideoCall}
              disabled={isCallLoading || isGroup || isCloudConversation || callState.phase !== 'idle'}
              className='p-2 hover:bg-muted rounded-full transition-colors hidden sm:block disabled:opacity-40 disabled:cursor-not-allowed'
              title='Gọi video'
            >
              <Video className='w-4 h-4' />
            </button>
            <div className='w-px h-5 bg-border mx-1 hidden sm:block' />
            <button className='p-2 hover:bg-muted rounded-full transition-colors'>
              <Search className='w-[18px] h-[18px]' />
            </button>
            <button
              onClick={() => setIsInfoSidebarOpen(!isInfoSidebarOpen)}
              className={cn(
                'p-2 rounded-full transition-colors hidden md:block',
                isInfoSidebarOpen ? 'bg-blue-50 text-primary hover:bg-blue-100' : 'hover:bg-muted'
              )}
            >
              <PanelsTopLeft className='w-[18px] h-[18px]' />
            </button>
          </div>
        </div>

        {/* Stranger Banner */}
        {!isGroup && !isCloudConversation && !isAiConversation && partnerId && (
          <StrangerBanner partnerId={partnerId} partnerName={conversation.name || 'Thành viên Zalo'} />
        )}

        {/* Pin Board & Messages Wrapper */}
        <div className='flex-1 relative flex flex-col min-h-0'>
          {/* Pin Board */}
          {!isCloudConversation && !isAiConversation && (
            <PinBoard conversationId={conversation.id} onScrollToMessage={scrollToMessage} />
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className='flex-1 overflow-y-auto px-4 py-4 flex flex-col-reverse custom-scrollbar'
          >
          {isLoading && (
            <div className='flex items-center justify-center flex-1 text-sm text-primary py-8'>{text.loading}</div>
          )}
          {allMessages.map((msg, index) => {
            const prevMsg = allMessages[index + 1]
            const nextMsg = allMessages[index - 1]
            const isFirst = !isSameGroup(msg, prevMsg)
            const isLast = !isSameGroup(msg, nextMsg)
            const isNewestVisible = index === 0
            return (
              <div key={msg.id} id={`msg-${msg.id}`} ref={isNewestVisible ? lastMessageRef : null}>
                <MessageBubble
                  message={msg}
                  isOwn={msg.senderId === user?.id}
                  isFirst={isFirst}
                  isLast={isLast}
                  isNewest={isNewestVisible}
                  conversation={conversation}
                  onReply={() => setReplyTo(msg)}
                  onForward={() => setForwardingMessage(msg)}
                  onAvatarClick={(userId) => {
                    if (userId === user?.id) {
                      setIsOwnerProfileOpen(true)
                    } else {
                      setProfileUserId(userId)
                      setIsProfileOpen(true)
                    }
                  }}
                  onRecall={() => handleStartVideoCall()}
                />
              </div>
            )
          })}
          {isFetchingNextPage && <div className='py-4 text-center text-sm text-muted-foreground'>{text.loading}</div>}
          {conversation.isGroup &&
            !conversation.isDisbanded &&
            !isCurrentUserRemovedFromGroup &&
            !hasNextPage &&
            !isFetchingNextPage && (
              <GroupIntroCard
                conversationId={conversation.id}
                groupTitle={getConversationDisplayName(conversation, 'Nhóm', undefined, user?.id)}
                groupMembers={(conversation.members || []).map((m) => ({
                  id: m.userId,
                  avatar: m.avatar,
                  name: m.fullName
                }))}
                targetAvatars={[]}
                secondaryLabel={null}
                t={t}
              />
            )}
          </div>
          <TypingIndicator typingUsers={typingUsers.filter(u => u.conversationId === conversation.id)} />
        </div>

        {conversation.isDisbanded || isCurrentUserRemovedFromGroup ? (
          <ChatInputRestricted message={text.disbanded.cannotSendMessage} />
        ) : !canSendMessages(conversation, user?.id || '') ? (
          <ChatInputRestricted message={text.restricted.onlyAdminCanSend} highlightTags />
        ) : (
          <ChatInput conversationId={conversation.id} isGroup={conversation.isGroup} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
        )}
        {forwardingMessage && (
          <ForwardDialog
            open
            message={forwardingMessage}
            onClose={() => setForwardingMessage(null)}
            onConfirm={(selectedConvIds, description) => {
              selectedConvIds.forEach((convId) => {
                const finalContent = description
                  ? `${forwardingMessage.content}\n---\n${description}`
                  : forwardingMessage.content || ''
                sendMessage(convId, finalContent, null, true)
              })
            }}
          />
        )}

        <RenameGroupDialog
          key={`${conversation.id}-${isRenameDialogOpen}`}
          open={isRenameDialogOpen}
          onOpenChange={setIsRenameDialogOpen}
          conversation={conversation}
          currentUserId={user?.id}
          onConfirm={handleRename}
          isPending={isUpdatingName}
        />
      </div>

      {isInfoSidebarOpen && !isInfoDialogOpen && (
        <div
          className='absolute inset-0 bg-transparent z-[35] min-[1150px]:hidden animate-in fade-in duration-200 cursor-pointer'
          onClick={() => setIsInfoSidebarOpen(false)}
        />
      )}

      {isCloudConversation ? (
        <CloudInfoSidebar />
      ) : isInfoDialogOpen ? (
        <GroupInfoDialog
          conversation={conversation}
          currentUserId={user?.id}
          open={isInfoDialogOpen}
          onOpenChange={setIsInfoDialogOpen}
          initialStep={infoDialogStep}
          onRenameClick={() => {
            setIsInfoDialogOpen(false)
            setIsRenameDialogOpen(true)
          }}
          onAvatarClick={triggerFileInput}
        />
      ) : (
        isInfoSidebarOpen && (
          <div
            className={cn(
              'h-full pointer-events-auto z-[40] bg-background w-87.5 shrink-0 border-l border-border',
              window.innerWidth < 1150 ? 'absolute top-0 right-0 shadow-2xl overflow-hidden' : 'relative'
            )}
          >
            <ChatInfoSidebar
              conversation={conversation}
              onRenameClick={() => setIsRenameDialogOpen(true)}
              onAvatarClick={triggerFileInput}
              managementOpenSignal={managementOpenSignal}
            />
          </div>
        )
      )}

      {selectedImage && (
        <ImageCropperDialog
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
          image={selectedImage.url}
          title={text['create-group-dialog'].updateAvatarTitle}
          confirmText={text['create-group-dialog'].confirm}
          cancelText={text['create-group-dialog'].cancel}
          dragToMoveText={text['create-group-dialog'].dragToMove}
          onConfirm={handleCropConfirm}
        />
      )}

      {/* Others Profile Dialog */}
      <OthersProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} userId={profileUserId || partnerId} />
      <OwnerProfileDialog open={isOwnerProfileOpen} onOpenChange={setIsOwnerProfileOpen} />

      {/* Video Call Overlays */}
      {callState.phase === 'ringing' && callState.callData && (
        <OutgoingCallScreen callData={callState.callData} onCancel={cancelOutgoing} onConnect={connectCall} />
      )}

      {callState.phase === 'active' && callState.callData && (
        <VideoCallRoom callData={callState.callData} onCallEnd={endCall} />
      )}

      {callState.incoming && (
        <IncomingCallDialog
          callerName={callState.incoming.callerName}
          callerAvatar={callState.incoming.callerAvatar}
          sessionId={callState.incoming.sessionId}
          onAccept={acceptIncoming}
          onReject={handleRejectIncoming}
        />
      )}
    </div>
  )
}
