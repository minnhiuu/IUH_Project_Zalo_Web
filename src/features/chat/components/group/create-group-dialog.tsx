import { useState, useMemo, useRef, useEffect } from 'react'
import { X, Camera, Search, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar } from '@/components/common/user-avatar'
import { BaseDialog } from '@/components/common/base-dialog'
import { cn } from '@/lib/utils'
import { useMyFriendsInfinite } from '@/features/friend/queries/use-queries'
import { useCreateGroupMutation, useUpdateGroupAvatarMutation } from '../../queries/use-mutations'
import type { FriendResponse } from '@/features/friend/schemas/friend.schema'
import { useChatText } from '../../i18n/use-chat-text'
import { formatDefaultGroupName } from '../../utils/group-name'
import { ImageCropperDialog } from '@/components/common/image-cropper-dialog'
import { getCroppedImg } from '@/utils/image-crop'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface CreateGroupDialogProps {
  isOpen: boolean
  onClose: () => void
  initialSelectedFriendIds?: string[]
}

export function CreateGroupDialog({ isOpen, onClose, initialSelectedFriendIds }: CreateGroupDialogProps) {
  const { text } = useChatText()
  const tg = text['create-group-dialog']
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: infiniteData, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyFriendsInfinite(50, isOpen)

  const createGroupMutation = useCreateGroupMutation()
  const updateAvatarMutation = useUpdateGroupAvatarMutation()

  const [groupName, setGroupName] = useState('')
  const [search, setSearch] = useState('')
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    file: File
  } | null>(null)

  const friends = useMemo(() => {
    return infiniteData?.pages.flatMap((page) => page.data) || []
  }, [infiniteData])

  const filteredFriends = useMemo(() => {
    if (!search) return friends
    return friends.filter(
      (f: FriendResponse) => f.userName.toLowerCase().includes(search.toLowerCase()) || f.userPhone.includes(search)
    )
  }, [friends, search])

  const selectedFriends = useMemo(() => {
    return selectedFriendIds
      .map((id) => friends.find((f: FriendResponse) => f.userId === id))
      .filter((f): f is FriendResponse => !!f)
  }, [friends, selectedFriendIds])

  const resetState = () => {
    setGroupName('')
    setSelectedFriendIds([])
    setSelectedFile(null)
    setSelectedImage(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  // Track previous open state to detect open/close transitions
  const prevIsOpenRef = useRef(false)

  // Sync initial selected friends when dialog opens, cleanup when it closes
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current
    prevIsOpenRef.current = isOpen

    if (isOpen && !wasOpen) {
      // Dialog just opened - set initial selections if provided
      if (initialSelectedFriendIds && initialSelectedFriendIds.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedFriendIds(initialSelectedFriendIds)
      }
    } else if (!isOpen && wasOpen) {
      // Dialog just closed - cleanup
      // eslint-disable-next-line react-hooks/set-state-in-effect
      resetState()
    }
  }, [isOpen, initialSelectedFriendIds])

  const handleToggleFriend = (friendId: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    )
  }

  const handleRemoveSelected = (friendId: string) => {
    setSelectedFriendIds((prev) => prev.filter((id) => id !== friendId))
  }

  const handleCreateGroup = () => {
    if (selectedFriendIds.length < 2) return

    // Calculate fallback name only at the moment of creation
    const finalName =
      groupName.trim() ||
      formatDefaultGroupName(
        selectedFriends.map((f) => f.userName),
        tg.andOthers
      )

    // Keep a reference to the file before resetting state
    const pendingAvatarFile = selectedFile

    // Step 1: Create group WITHOUT avatar for instant response
    createGroupMutation.mutate(
      {
        name: finalName,
        isGroup: true,
        memberIds: selectedFriendIds,
        avatar: null
      },
      {
        onSuccess: (newConversation) => {
          onClose()
          resetState()

          // Step 2: Upload avatar in background (fire-and-forget)
          if (pendingAvatarFile && newConversation.id) {
            updateAvatarMutation.mutate({ id: newConversation.id, file: pendingAvatarFile })
          }
        }
      }
    )
  }

  const handleCancelClick = () => {
    if (selectedFriendIds.length > 0) {
      setIsCancelConfirmOpen(true)
    } else {
      onClose()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage({ url: reader.result as string, file })
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    }
  }

  const handleCropConfirm = async (data: {
    percent: { x: number; y: number; width: number; height: number }
    pixels: { x: number; y: number; width: number; height: number }
    zoom: number
  }) => {
    if (!selectedImage) return
    try {
      const croppedBlob = await getCroppedImg(selectedImage.url, data.pixels)
      if (croppedBlob) {
        const croppedFile = new File([croppedBlob], 'group-avatar.jpg', { type: 'image/jpeg' })
        setSelectedFile(croppedFile)

        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(URL.createObjectURL(croppedBlob))
      }
      setSelectedImage(null)
    } catch (err) {
      console.error('Crop failed', err)
      setSelectedImage(null)
    }
  }

  const handleRemoveAvatar = () => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const isCreateDisabled = selectedFriendIds.length < 2 || createGroupMutation.isPending
  const showSidebar = selectedFriendIds.length > 0

  const AvatarButton = (
    <div className='relative shrink-0'>
      <input type='file' ref={fileInputRef} onChange={handleFileChange} accept='image/*' className='hidden' />
      <button
        onClick={previewUrl ? undefined : triggerFileInput}
        className='curosr-pointer w-11 h-11 rounded-full border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors shrink-0 overflow-hidden relative group outline-none'
      >
        {previewUrl ? (
          <img src={previewUrl} alt='Group Avatar Preview' className='w-full h-full object-cover' />
        ) : (
          <Camera className='w-5 h-5' />
        )}

        {/* Hover Overlay */}
        <div className='cursor-pointer absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity'>
          <Camera className='w-4 h-4 text-white' />
        </div>
      </button>
    </div>
  )

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className='p-0 gap-0 rounded-[8px] sm:max-w-[525px] w-full shrink-0 outline-none border-none shadow-xl overflow-hidden'
          showCloseButton={false}
        >
          <DialogHeader className='px-4 h-[48px] flex flex-row items-center justify-between border-b bg-background shrink-0 space-y-0'>
            <DialogTitle className='text-[16px] font-bold'>{tg.title}</DialogTitle>
            <DialogClose asChild>
              <button className='p-1.5 hover:bg-muted rounded-full transition-colors cursor-pointer outline-none'>
                <X className='w-5 h-5 text-muted-foreground/80' />
              </button>
            </DialogClose>
          </DialogHeader>

          {/* Top Section - Inputs */}
          <div className='p-4 space-y-3 bg-background'>
            <div className='flex items-center gap-3'>
              {previewUrl ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>{AvatarButton}</DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-48'>
                    <DropdownMenuItem
                      onClick={triggerFileInput}
                      className='cursor-pointer py-2 text-[14px] whitespace-nowrap overflow-hidden shrink-0'
                    >
                      {tg.changeAvatar}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleRemoveAvatar}
                      className='cursor-pointer py-2 text-[14px] text-destructive focus:text-destructive focus:bg-destructive/10 whitespace-nowrap overflow-hidden shrink-0'
                    >
                      {tg.removeAvatar}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                AvatarButton
              )}

              <div className='flex-1 relative overflow-hidden'>
                <Input
                  placeholder={tg.namePlaceholder}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className='border-0 border-b rounded-none px-0 h-12 py-2 focus-visible:ring-0 focus-visible:border-primary shadow-none text-[15.5px] bg-transparent dark:bg-transparent placeholder:text-muted-foreground/40 w-full'
                />
              </div>
            </div>

            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60' />
              <Input
                placeholder={tg.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-9 h-9 rounded-full bg-muted/40 border-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 text-[13.5px]'
              />
            </div>
          </div>

          {/* User List Section */}
          <div className='flex h-[420px] border-t bg-background overflow-hidden relative'>
            <div
              className={cn(
                'flex flex-col transition-all duration-300 ease-in-out h-full bg-background overflow-hidden flex-1 min-w-0'
              )}
            >
              <ScrollArea
                className='flex-1'
                viewportProps={{
                  onScroll: (e) => {
                    const target = e.currentTarget
                    if (
                      target.scrollHeight - target.scrollTop <= target.clientHeight + 10 &&
                      hasNextPage &&
                      !isFetchingNextPage
                    ) {
                      fetchNextPage()
                    }
                  }
                }}
              >
                <div className='p-0'>
                  {filteredFriends.map((friend: FriendResponse) => {
                    const isSelected = selectedFriendIds.includes(friend.userId)
                    return (
                      <div
                        key={friend.userId}
                        onClick={() => handleToggleFriend(friend.userId)}
                        className='px-4 py-2 flex items-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors group'
                      >
                        <div
                          className={cn(
                            'w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all shrink-0',
                            isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                          )}
                        >
                          {isSelected && <Check className='w-3 h-3 text-white stroke-3' />}
                        </div>

                        <UserAvatar name={friend.userName} src={friend.userAvatar} className='w-9 h-9 shrink-0' />
                        <span className='text-[14px] font-medium truncate'>{friend.userName}</span>
                      </div>
                    )
                  })}
                  {isFetchingNextPage && (
                    <div className='p-4 text-center text-[11px] text-muted-foreground'>Đang tải...</div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {showSidebar && (
              <div
                className={cn(
                  'flex flex-col bg-background transition-all duration-300 ease-in-out h-full overflow-hidden shrink-0 w-[210px] p-2.5 pb-2 pl-1'
                )}
              >
                <div className='flex flex-col border rounded-[8px] h-full overflow-hidden bg-background'>
                  <div className='p-2.5 py-1.5 flex items-center gap-1.5 whitespace-nowrap overflow-hidden shrink-0'>
                    <span className='text-[11.5px] font-bold'>{tg.selected}</span>
                    <span className='text-[10.5px] px-1.5 py-0.25 rounded-md bg-dialog-selection-badge-bg text-dialog-selection-badge-text'>
                      {selectedFriendIds.length}/100
                    </span>
                  </div>

                  <ScrollArea className='flex-1'>
                    <div className='p-1.5 space-y-1'>
                      {selectedFriends.map((friend: FriendResponse) => (
                        <div
                          key={friend.userId}
                          className='flex items-center gap-2 p-1 px-2 rounded-full bg-dialog-selection-bg text-dialog-selection-text group transition-colors w-full overflow-hidden'
                        >
                          <UserAvatar
                            name={friend.userName}
                            src={friend.userAvatar}
                            className='w-6 h-6 shrink-0 shadow-sm'
                          />
                          <span className='flex-1 text-[12px] truncate font-medium'>{friend.userName}</span>
                          <button
                            onClick={() => handleRemoveSelected(friend.userId)}
                            className='p-0 hover:bg-transparent rounded-full flex items-center justify-center shrink-0 ml-0.5 cursor-pointer transition-transform hover:scale-110 active:scale-95'
                          >
                            <div className='w-4.5 h-4.5 bg-icon-x-bg rounded-full flex items-center justify-center shadow-sm transition-colors'>
                              <X className='w-3 h-3 text-icon-x-text stroke-[3.5]' />
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>

          <div className='p-3 px-4 border-t flex items-center justify-end gap-2.5 bg-background'>
            <Button variant='secondary' onClick={handleCancelClick}>
              {tg.cancel}
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={isCreateDisabled}
              variant={isCreateDisabled ? 'disabled' : 'default'}
            >
              {createGroupMutation.isPending ? '...' : tg.create}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BaseDialog
        open={isCancelConfirmOpen}
        onOpenChange={setIsCancelConfirmOpen}
        title='Xác nhận'
        description='Bạn muốn hủy tạo nhóm này?'
        confirmText='Có'
        cancelText='Không'
        onConfirm={() => {
          setIsCancelConfirmOpen(false)
          onClose()
          resetState()
        }}
        onCancel={() => setIsCancelConfirmOpen(false)}
      />

      {selectedImage && (
        <ImageCropperDialog
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
          image={selectedImage.url}
          title={tg.updateAvatarTitle}
          confirmText={tg.confirm}
          cancelText={tg.cancel}
          dragToMoveText={tg.dragToMove}
          onConfirm={handleCropConfirm}
        />
      )}
    </>
  )
}
