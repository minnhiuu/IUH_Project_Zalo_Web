import { useState, useMemo, useRef, useEffect } from 'react'
import { X, Camera, Search, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar } from '@/components/common/user-avatar'
import { BaseDialog } from '@/components/common/base-dialog'
import { cn } from '@/lib/utils'
import { useMyFriendsInfinite } from '@/features/friend/queries/use-queries'
import { useCreateGroupMutation } from '../queries/use-mutations'
import type { FriendResponse } from '@/features/friend/schemas/friend.schema'
import { useChatText } from '../i18n/use-chat-text'
import { formatDefaultGroupName } from '../utils/group-name'

interface CreateGroupDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateGroupDialog({ isOpen, onClose }: CreateGroupDialogProps) {
  const { text } = useChatText()
  const tg = text['create-group-dialog']
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: infiniteData, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyFriendsInfinite(50, isOpen)

  const createGroupMutation = useCreateGroupMutation()

  const [groupName, setGroupName] = useState('')
  const [search, setSearch] = useState('')
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  // Cleanup preview URL to prevent memory leaks and reset state when closing
  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      resetState()
    }
  }, [isOpen])

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

    createGroupMutation.mutate(
      {
        request: {
          name: finalName,
          isGroup: true,
          memberIds: selectedFriendIds,
          avatar: null
        },
        file: selectedFile
      },
      {
        onSuccess: () => {
          onClose()
          resetState()
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
      setSelectedFile(file)

      // Revoke old preview and set new one
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const isCreateDisabled = selectedFriendIds.length < 2 || createGroupMutation.isPending
  const showSidebar = selectedFriendIds.length > 0

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className='p-0 gap-0 overflow-hidden rounded-lg sm:max-w-lg w-full shrink-0'
          showCloseButton={true}
        >
          <DialogHeader className='px-4 py-2.5 border-b bg-background'>
            <DialogTitle className='text-[16px] font-semibold'>{tg.title}</DialogTitle>
          </DialogHeader>

          {/* Top Section - Inputs */}
          <div className='p-4 space-y-4 bg-background'>
            <div className='flex items-center gap-3'>
              <div className='relative shrink-0'>
                <input type='file' ref={fileInputRef} onChange={handleFileChange} accept='image/*' className='hidden' />
                <button
                  onClick={triggerFileInput}
                  className='curosr-pointer w-11 h-11 rounded-full border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors shrink-0 overflow-hidden relative group'
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

              <div className='flex-1 relative'>
                <Input
                  placeholder={tg.namePlaceholder}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className='border-0 border-b rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-primary shadow-none text-[15px] bg-transparent dark:bg-transparent placeholder:text-muted-foreground/50'
                />
              </div>
            </div>

            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
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
                'flex flex-col border-r transition-all duration-300 ease-in-out h-full',
                showSidebar ? 'w-[60%]' : 'w-full'
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
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                            isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30 border-2'
                          )}
                        >
                          {isSelected && <Check className='w-3.5 h-3.5 text-white stroke-3' />}
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

            {/* Selection Sidebar - 40% */}
            <div
              className={cn(
                'flex flex-col bg-background transition-all duration-300 ease-in-out h-full overflow-hidden',
                showSidebar ? 'w-[40%] border-l' : 'w-0 border-l-0'
              )}
            >
              <div className='p-4 py-2 border-b flex items-center justify-between whitespace-nowrap overflow-hidden'>
                <span className='text-[12.5px] font-semibold'>{tg.selected}</span>
                <span className='text-[11px] font-bold px-2 py-0.5 rounded-md bg-(--dialog-selection-badge-bg) text-(--dialog-selection-badge-text)'>
                  {selectedFriendIds.length}/100
                </span>
              </div>

              <ScrollArea className='flex-1'>
                <div className='p-2 px-3 space-y-1.5'>
                  {selectedFriends.map((friend: FriendResponse) => (
                    <div
                      key={friend.userId}
                      className='flex items-center gap-2.5 p-1.5 px-3 rounded-full bg-(--dialog-selection-bg) text-(--dialog-selection-text) group'
                    >
                      <UserAvatar name={friend.userName} src={friend.userAvatar} className='w-6 h-6 shrink-0' />
                      <span className='flex-1 text-[12.5px] truncate font-medium'>{friend.userName}</span>
                      <button
                        onClick={() => handleRemoveSelected(friend.userId)}
                        className='p-0 hover:bg-transparent rounded-full flex items-center justify-center shrink-0 ml-1 cursor-pointer'
                      >
                        <X className='w-4 h-4 text-white dark:text-brand-blue-dark bg-(--icon-x-bg) rounded-full p-0.5' />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className='p-4 border-t flex items-center justify-end gap-3 bg-muted/5'>
            <Button variant='secondary' onClick={handleCancelClick} className='px-6 h-9 text-[13px]'>
              {tg.cancel}
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={isCreateDisabled}
              className={cn(
                'px-6 h-9 text-[13px] font-bold transition-all',
                isCreateDisabled
                  ? 'bg-(--dialog-selection-btn-disabled-bg) text-(--dialog-selection-btn-disabled-text) opacity-100 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-hover shadow-md capitalize'
              )}
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
    </>
  )
}
