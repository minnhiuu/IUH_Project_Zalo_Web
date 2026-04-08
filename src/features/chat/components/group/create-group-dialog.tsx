import { useState, useMemo, useRef, useEffect } from 'react'
import { Camera, Search, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BaseDialog } from '@/components/common/base-dialog'
import { cn } from '@/lib/utils'
import {
  useCreateGroupMutation,
  useUpdateGroupAvatarMutation,
  useAddMembersMutation
} from '../../queries/use-mutations'
import { useFriendsDirectory, useSearchMembersInfinite } from '../../queries/use-queries'
import type { SearchMemberResponse } from '../../schemas/chat.schema'
import { useChatText } from '../../i18n/use-chat-text'
import { ImageCropperDialog } from '@/components/common/image-cropper-dialog'
import { getCroppedImg } from '@/utils/image-crop'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MemberItem } from './member-item'
import { SelectedMemberSidebar } from './selected-member-sidebar'
import { useDebounce } from '@/hooks/use-debounce'

interface CreateGroupDialogProps {
  isOpen: boolean
  onClose: () => void
  initialSelectedFriendIds?: string[]
  conversationId?: string
}

export function CreateGroupDialog({
  isOpen,
  onClose,
  initialSelectedFriendIds,
  conversationId
}: CreateGroupDialogProps) {
  const { text } = useChatText()
  const tg = text['create-group-dialog']
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [groupName, setGroupName] = useState('')
  const [search, setSearch] = useState('')
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])
  const debouncedSearch = useDebounce(search, 300)
  const normalizedSearch = debouncedSearch.trim().replace(/^\+/, '')
  const hasSearch = !!normalizedSearch

  // Directory Mode: When search is empty
  const { data: directoryData } = useFriendsDirectory(conversationId || null, isOpen && !hasSearch)

  // Search Mode: When search has value
  const {
    data: searchData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useSearchMembersInfinite(normalizedSearch, conversationId || null, isOpen && hasSearch)

  const createGroupMutation = useCreateGroupMutation()
  const updateAvatarMutation = useUpdateGroupAvatarMutation()
  const addMembersMutation = useAddMembersMutation()
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    file: File
  } | null>(null)

  const allPossibleMembers = useMemo(() => {
    const list: SearchMemberResponse[] = []
    if (directoryData) {
      Object.values(directoryData).forEach((members: SearchMemberResponse[]) => {
        list.push(...members)
      })
    }
    if (searchData) {
      searchData.pages.forEach((page) => {
        if (page && Array.isArray(page.data)) {
          list.push(...page.data)
        }
      })
    }
    return list
  }, [directoryData, searchData])

  const selectedFriends = useMemo(() => {
    // Collect from all sources to ensure we find the object for the ID
    const uniqueMap = new Map<string, SearchMemberResponse>()
    allPossibleMembers.forEach((m: SearchMemberResponse) => uniqueMap.set(m.userId, m))

    return selectedFriendIds.map((id) => uniqueMap.get(id)).filter((f): f is SearchMemberResponse => !!f)
  }, [allPossibleMembers, selectedFriendIds])

  const resetState = () => {
    setGroupName('')
    setSearch('')
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

  const handleCreateGroup = async () => {
    if (selectedFriendIds.length === 0) return

    if (conversationId) {
      // Add members mode
      try {
        await addMembersMutation.mutateAsync({ conversationId, memberIds: selectedFriendIds })
        onClose()
        resetState()
      } catch (error) {
        console.error('Add members failed', error)
      }
      return
    }

    if (selectedFriendIds.length < 2) return

    // Keep a reference to the file before resetting state
    const pendingAvatarFile = selectedFile

    // Step 1: Create group WITHOUT avatar for instant response
    // Don't send auto-generated name — FE derives it from members dynamically
    createGroupMutation.mutate(
      {
        name: groupName.trim() || ' ',
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

  const isCreateDisabled = conversationId
    ? selectedFriendIds.length === 0 || addMembersMutation.isPending
    : selectedFriendIds.length < 2 || createGroupMutation.isPending
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
          className='p-0 gap-0 rounded-[8px] sm:max-w-[550px] w-full shrink-0 outline-none border-none shadow-xl overflow-hidden h-[620px] flex flex-col'
          showCloseButton={false}
        >
          <DialogHeader className='px-4 h-[56px] flex flex-row items-center justify-between border-b bg-background shrink-0 space-y-0'>
            <DialogTitle className='text-[17px] font-semibold'>
              {conversationId ? tg.addMembersTitle : tg.title}
            </DialogTitle>
            <DialogClose asChild>
              <button className='p-1.5 hover:bg-muted rounded-full transition-colors cursor-pointer outline-none'>
                <X className='w-5 h-5 text-muted-foreground/80' />
              </button>
            </DialogClose>
          </DialogHeader>

          {/* Top Section - Inputs */}
          {!conversationId && (
            <div className='p-4 space-y-3 bg-background shrink-0'>
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
            </div>
          )}

          <div className='p-4 pt-2 space-y-3 bg-background shrink-0'>
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
          <div className='flex-1 min-h-0 border-t bg-background overflow-hidden'>
            <div className='flex h-full min-h-0'>
              <div
                className={cn(
                  'flex flex-col flex-1 min-h-0 border-r bg-background transition-all duration-300 relative overflow-hidden'
                )}
              >
                <ScrollArea
                  className='h-full'
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
                    {!search ? (
                      // Directory Mode Rendering
                      directoryData &&
                      Object.entries(directoryData)
                        .filter(([letter]) => letter !== 'Recently' && letter !== 'Trò chuyện gần đây')
                        .map(([letter, members]) => (
                          <div key={letter}>
                            <div className='px-4 pt-2 text-[13px] font-bold text-primary bg-background sticky top-0 z-10'>
                              {letter}
                            </div>
                            {members.map((member) => (
                              <MemberItem
                                key={member.userId}
                                member={member}
                                isSelected={selectedFriendIds.includes(member.userId)}
                                onToggle={() => handleToggleFriend(member.userId)}
                              />
                            ))}
                          </div>
                        ))
                    ) : (
                      // Search Mode Rendering
                      <>
                        {searchData?.pages[0].data.length === 0 && !isFetchingNextPage ? (
                          <div className='flex flex-col items-center justify-center p-12 text-center'>
                            <div className='w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-3'>
                              <Search className='w-8 h-8 text-muted-foreground/40' />
                            </div>
                            <p className='text-[14px] text-muted-foreground/60 font-medium'>{text.emptyStateSearch}</p>
                            <p className='text-[12px] text-muted-foreground/40 mt-1 pl-4 pr-4'>
                              Thử tìm kiếm theo tên hoặc số điện thoại khác
                            </p>
                          </div>
                        ) : (
                          <>
                            {searchData?.pages.map((page, i) => (
                              <div key={i}>
                                {page.data.map((member) => (
                                  <MemberItem
                                    key={member.userId}
                                    member={member}
                                    isSelected={selectedFriendIds.includes(member.userId)}
                                    onToggle={() => handleToggleFriend(member.userId)}
                                  />
                                ))}
                              </div>
                            ))}
                            {isFetchingNextPage && (
                              <div className='p-4 text-center text-[11px] text-muted-foreground'>{text.loading}</div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {showSidebar && (
                <div className='w-[210px] h-full shrink-0 p-2.5 pb-2 pl-1 bg-background'>
                  <SelectedMemberSidebar
                    selectedFriends={selectedFriends}
                    onRemove={handleRemoveSelected}
                    selectedCount={selectedFriendIds.length}
                    title={tg.selected}
                  />
                </div>
              )}
            </div>
          </div>

          <div className='p-3 px-4 border-t flex items-center justify-end gap-3 bg-background shrink-0'>
            <Button variant='secondary' onClick={handleCancelClick}>
              {tg.cancel}
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={isCreateDisabled}
              variant={isCreateDisabled ? 'disabled' : 'default'}
            >
              {createGroupMutation.isPending || addMembersMutation.isPending
                ? '...'
                : conversationId
                  ? tg.confirm
                  : tg.create}
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
