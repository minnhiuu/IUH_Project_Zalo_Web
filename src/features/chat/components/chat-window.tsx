import { Phone, Video, Search, PanelsTopLeft, Users, Pencil } from 'lucide-react'
import { useMessagesInfiniteQuery } from '../queries/use-queries'
import { useAuth } from '@/features/auth'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'
import { useChatScroll } from '../hooks/use-chat-scroll'
import { useChatText } from '../i18n/use-chat-text'
import {
  useMarkAsReadMutation,
  useUpdateGroupNameMutation,
  useUpdateGroupAvatarMutation
} from '../queries/use-mutations'
import { useEffect, useRef, useMemo, useState } from 'react'
import type { ConversationResponse, MessageResponse } from '../schemas/chat.schema'
import { ForwardModal } from './forward-modal'
import { formatLastSeen } from '@/utils/date'
import { CloudInfoSidebar } from './cloud-info-sidebar'
import { AiChatWindow } from './ai-chat-window'
import { UserAvatar } from '@/components/common/user-avatar'
import { GroupAvatar } from './group-avatar'
import { BaseDialog } from '@/components/common/base-dialog'
import { Input } from '@/components/ui/input'
import { ImageCropperDialog } from '@/components/common/image-cropper-dialog'
import { getCroppedImg } from '@/utils/image-crop'
import { cn } from '@/lib/utils'
import { GroupInfoDialog } from './group-info-dialog'
import { showLoadingToast, showSuccessToast, showErrorToast } from '@/utils/toast'
import { toast } from 'sonner'

export function ChatWindow({ conversation }: { conversation: ConversationResponse }) {
  const { user } = useAuth()
  const { text } = useChatText()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMessagesInfiniteQuery(conversation.id)

  const { scrollRef, handleScroll } = useChatScroll({ fetchNextPage, hasNextPage, isFetchingNextPage })
  const { mutate: markAsRead } = useMarkAsReadMutation()
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const lastReadSentId = useRef<string | null>(null)

  const [replyTo, setReplyTo] = useState<MessageResponse | null>(null)
  const [forwardingMessage, setForwardingMessage] = useState<MessageResponse | null>(null)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
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
 
  const handleRename = () => {
    if (!newGroupName.trim() || newGroupName === conversation.name) {
      setIsRenameDialogOpen(false)
      return
    }
    const toastId = showLoadingToast(text.toasts.updating)
    updateGroupName(
      { id: conversation.id, name: newGroupName.trim() },
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

  const isCloudConversation = conversation.members?.length === 1 && conversation.members[0]?.userId === user?.id
  const isAiConversation = conversation.members?.some((m) => m.userId === 'ai-assistant-001') ?? false

  useEffect(() => {
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
  }, [latestMessageId, latestMessageSenderId, conversation.id, conversation.unreadCount, markAsRead, user?.id])

  const isSameGroup = (msg1: MessageResponse, msg2: MessageResponse) => {
    if (!msg1 || !msg2) return false
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
          <div className='flex items-center space-x-3 min-w-0 flex-1'>
            <div className='relative shrink-0 hidden sm:block'>
              <input type='file' ref={fileInputRef} onChange={handleAvatarChange} accept='image/*' className='hidden' />
              <div
                onClick={conversation.isGroup && !isAiConversation ? () => setIsInfoDialogOpen(true) : undefined}
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
                  <UserAvatar src={conversation.avatar} name={conversation.name || 'User'} className='w-10 h-10' />
                )}
              </div>
              {conversation.status === 'ONLINE' && !conversation.isGroup && (
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full' />
              )}
            </div>
            <div className='min-w-0 flex-1 group/header'>
              <button
                disabled={!conversation.isGroup || isCloudConversation}
                onClick={() => {
                  setNewGroupName(conversation.name || '')
                  setIsRenameDialogOpen(true)
                }}
                className='flex items-center gap-1.5 max-w-full group/btn'
              >
                <h2 className='text-[16px] font-semibold text-foreground/90 leading-tight overflow-hidden whitespace-nowrap truncate'>
                  {isCloudConversation ? 'My Documents' : conversation.name}
                </h2>
                {conversation.isGroup && !isCloudConversation && (
                  <div className='p-1 hover:bg-muted rounded-full opacity-0 group-hover/header:opacity-100 transition-all shrink-0 cursor-pointer'>
                    <Pencil className='w-3.5 h-3.5 text-muted-foreground' />
                  </div>
                )}
              </button>
              <p className='text-[12px] text-muted-foreground mt-0.5 leading-tight flex items-center gap-1 overflow-hidden whitespace-nowrap'>
                {isCloudConversation ? (
                  'Lưu và đồng bộ dữ liệu giữa các thiết bị'
                ) : conversation.isGroup ? (
                  <span className='flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors'>
                    <Users className='w-4 h-4' />
                    {text.status.membersCount(conversation.members?.length || 0)}
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
            <button className='p-2 hover:bg-muted rounded-full transition-colors hidden sm:block'>
              <Phone className='w-[18px] h-[18px]' />
            </button>
            <button className='p-2 hover:bg-muted rounded-full transition-colors hidden sm:block'>
              <Video className='w-4 h-4' />
            </button>
            <div className='w-px h-5 bg-border mx-1 hidden sm:block' />
            <button className='p-2 hover:bg-muted rounded-full transition-colors'>
              <Search className='w-[18px] h-[18px]' />
            </button>
            <button className='p-2 hover:bg-muted rounded-full transition-colors hidden md:block'>
              <PanelsTopLeft className='w-[18px] h-[18px]' />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className='flex-1 overflow-y-auto px-4 py-4 flex flex-col-reverse custom-scrollbar'
        >
          {isLoading && (
            <div className='flex items-center justify-center flex-1 text-sm text-primary py-8'>Đang tải...</div>
          )}
          {allMessages.map((msg, index) => {
            const prevMsg = allMessages[index + 1]
            const nextMsg = allMessages[index - 1]
            const isFirst = !isSameGroup(msg, prevMsg)
            const isLast = !isSameGroup(msg, nextMsg)
            return (
              <div key={msg.id} ref={index === 0 ? lastMessageRef : null}>
                <MessageBubble
                  message={msg}
                  isOwn={msg.senderId === user?.id}
                  isFirst={isFirst}
                  isLast={isLast}
                  isNewest={index === 0}
                  conversation={conversation}
                  onReply={() => setReplyTo(msg)}
                  onForward={() => setForwardingMessage(msg)}
                />
              </div>
            )
          })}
          {isFetchingNextPage && <div className='py-4 text-center text-sm text-muted-foreground'>Đang tải thêm...</div>}
        </div>

        <ChatInput conversationId={conversation.id} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
        {forwardingMessage && <ForwardModal message={forwardingMessage} onClose={() => setForwardingMessage(null)} />}

        <BaseDialog
          open={isRenameDialogOpen}
          onOpenChange={setIsRenameDialogOpen}
          title={text['rename-group-dialog'].title}
          confirmText={text['rename-group-dialog'].confirm}
          cancelText={text['rename-group-dialog'].cancel}
          onConfirm={handleRename}
          isPending={isUpdatingName}
        >
          <div className='space-y-4'>
            <div className='flex justify-center'>
              <div className='relative'>
                <GroupAvatar
                  avatars={conversation.members?.map((m) => m.avatar) || []}
                  names={conversation.members?.map((m) => m.fullName) || []}
                  count={conversation.members?.length || 0}
                  size='lg'
                />
              </div>
            </div>
            <p className='text-[14.5px] text-center text-foreground px-4 leading-normal'>
              {text['rename-group-dialog'].description}
            </p>
            <div className='px-1'>
              <Input
                autoFocus
                onFocus={(e) => e.target.select()}
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder={text['rename-group-dialog'].placeholder}
                className='h-10 text-[15px]'
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              />
            </div>
          </div>
        </BaseDialog>
      </div>

      {isCloudConversation && <CloudInfoSidebar />}

      <GroupInfoDialog
        conversation={conversation}
        open={isInfoDialogOpen}
        onOpenChange={setIsInfoDialogOpen}
        onRenameClick={() => {
          setIsInfoDialogOpen(false)
          setIsRenameDialogOpen(true)
        }}
        onAvatarClick={triggerFileInput}
      />

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
    </div>
  )
}
