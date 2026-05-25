import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Camera, Search, X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CharacterCounterInput } from '@/components/ui/character-counter-input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BaseDialog } from '@/components/common/base-dialog'
import { cn } from '@/lib/utils'
import {
  useCreateGroupMutation,
  useUpdateGroupAvatarMutation,
  useAddMembersMutation,
  useSendGroupInvitesMutation
} from '../../../queries/use-mutations'
import { useFriendsDirectory, useSearchMembersInfinite } from '../../../queries/use-queries'
import type { SearchMemberResponse } from '../../../schemas/chat.schema'
import { useChatText } from '../../../i18n/use-chat-text'
import { ImageCropperDialog } from '@/components/common/image-cropper-dialog'
import { getCroppedImg } from '@/utils/image-crop'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MemberItem } from '../members/member-item'
import { SelectedMemberSidebar } from '../members/selected-member-sidebar'
import { useDebounce } from '@/hooks/use-debounce'
import { showSimpleToast } from '@/utils/toast'

interface CreateGroupDialogProps {
  isOpen: boolean
  onClose: () => void
  initialSelectedFriendIds?: string[]
  conversationId?: string
}

interface CropAreaData {
  percent: { x: number; y: number; width: number; height: number }
  pixels: { x: number; y: number; width: number; height: number }
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
  const navigate = useNavigate()

  const [groupName, setGroupName] = useState('')
  const [search, setSearch] = useState('')
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])
  const [tempSearchSelectedIds, setTempSearchSelectedIds] = useState<string[]>([])
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ url: string; file: File } | null>(null)
  const [selectedMembersCache, setSelectedMembersCache] = useState<Record<string, SearchMemberResponse>>({})

  const debouncedSearch = useDebounce(search, 300)
  const normalizedSearch = debouncedSearch.trim().replace(/^\+/, '')
  const hasSearch = !!normalizedSearch

  // Queries
  const { data: directoryData } = useFriendsDirectory(conversationId || null, isOpen)
  const {
    data: searchData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isSearchLoading
  } = useSearchMembersInfinite(normalizedSearch, conversationId || null, isOpen && hasSearch)

  // Sync seen members to cache during render to ensure selected members don't vanish when search clears
  const seenMembers: Record<string, SearchMemberResponse> = {}
  searchData?.pages.forEach((page) => page.data.forEach((m) => (seenMembers[m.userId] = m)))
  if (directoryData) {
    Object.values(directoryData).forEach((members: SearchMemberResponse[]) => {
      members.forEach((m) => (seenMembers[m.userId] = m))
    })
  }

  const hasNewMembers = Object.keys(seenMembers).some((id) => !selectedMembersCache[id])
  if (hasNewMembers) {
    setSelectedMembersCache((prev) => ({ ...prev, ...seenMembers }))
  }

  // Mutations
  const createGroupMutation = useCreateGroupMutation()
  const updateAvatarMutation = useUpdateGroupAvatarMutation()
  const addMembersMutation = useAddMembersMutation()
  const sendInvitesMutation = useSendGroupInvitesMutation()

  // 2. Map selected IDs to full objects using cache
  const selectedFriends = useMemo(() => {
    return selectedFriendIds
      .map((id) => selectedMembersCache[id])
      .filter((friend): friend is SearchMemberResponse => !!friend)
  }, [selectedFriendIds, selectedMembersCache])

  const resetState = () => {
    setGroupName('')
    setSearch('')
    setSelectedFriendIds([])
    setTempSearchSelectedIds([])
    setSelectedMembersCache({}) // Clear cache on reset
    setSelectedFile(null)
    setSelectedImage(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  // Logic previously in useEffect moved to render-phase synchronization to avoid cascading renders
  const [prevIsOpen, setPrevIsOpen] = useState(false)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      if (initialSelectedFriendIds && initialSelectedFriendIds.length > 0) {
        setSelectedFriendIds(initialSelectedFriendIds)
      }
    } else {
      resetState()
    }
  }

  // Auto-select phone number matches - using render-phase sync to avoid useEffect warnings
  const [lastAutoSelectedQuery, setLastAutoSelectedQuery] = useState('')
  if (hasSearch && normalizedSearch !== lastAutoSelectedQuery && searchData) {
    setLastAutoSelectedQuery(normalizedSearch)
    const candidates = searchData.pages.flatMap((page) => page?.data || [])
    const searchDigits = normalizedSearch.replace(/\D/g, '')
    const phoneMatches = candidates.filter(
      (member) => member.phoneNumber && member.phoneNumber.replace(/\D/g, '').includes(searchDigits)
    )

    if (phoneMatches.length > 0) {
      const newMatchIds = phoneMatches.map((m) => m.userId).filter((id) => !tempSearchSelectedIds.includes(id))

      if (newMatchIds.length > 0) {
        setTempSearchSelectedIds((prev) => Array.from(new Set([...prev, ...newMatchIds])))
      }
    }
  }

  const handleClearSearch = () => {
    setSearch('')
    setTempSearchSelectedIds([])
  }

  const handleToggleFriend = (friendId: string) => {
    if (hasSearch) {
      setTempSearchSelectedIds((prev) =>
        prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
      )
    } else {
      setSelectedFriendIds((prev) =>
        prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
      )
    }
  }

  const handleConfirmSearchSelection = () => {
    setSelectedFriendIds((prev) => Array.from(new Set([...prev, ...tempSearchSelectedIds])))
    handleClearSearch()
  }

  const handleRemoveSelected = (friendId: string) => {
    setSelectedFriendIds((prev) => prev.filter((id) => id !== friendId))
  }

  const handleCreateGroup = async () => {
    if (selectedFriendIds.length === 0) return

    if (conversationId) {
      try {
        const result = await addMembersMutation.mutateAsync({ conversationId, memberIds: selectedFriendIds })
        const addedMemberIds = new Set(result.members?.map((m) => m.userId) || [])

        // Send invites to non-friend members if any (filter by those we just tried to add)
        const newlyInvitedIds = result.invitedUserIds?.filter((id) => selectedFriendIds.includes(id)) || []
        if (newlyInvitedIds.length > 0) {
          sendInvitesMutation.mutate({ conversationId: conversationId, userIds: newlyInvitedIds })
        }

        const failedCount = selectedFriendIds.filter(
          (id) => !addedMemberIds.has(id) && !newlyInvitedIds.includes(id)
        ).length

        onClose()
        resetState()
        if (failedCount > 0) {
          showSimpleToast(tg.addMemberFailed(failedCount))
        }
      } catch (error) {
        console.error('Add members failed', error)
      }
      return
    }

    if (selectedFriendIds.length < 2) return
    const pendingFile = selectedFile

    createGroupMutation.mutate(
      {
        name: groupName.trim() || ' ',
        isGroup: true,
        memberIds: selectedFriendIds,
        avatar: null
      },
      {
        onSuccess: (conversation) => {
          onClose()
          resetState()
          navigate(`/chat/c/${conversation.id}`)
          if (pendingFile && conversation.id) {
            updateAvatarMutation.mutate({ id: conversation.id, file: pendingFile })
          }

          // Send invites to non-friend members (fire-and-forget)
          const invitedIds = conversation.invitedUserIds
          if (invitedIds && invitedIds.length > 0 && conversation.id) {
            sendInvitesMutation.mutate({ conversationId: conversation.id, userIds: invitedIds })
          }
        }
      }
    )
  }

  const handleCancelClick = () => {
    if (selectedFriendIds.length > 0) setIsCancelConfirmOpen(true)
    else onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setSelectedImage({ url: reader.result as string, file })
      reader.readAsDataURL(file)
      e.target.value = ''
    }
  }

  const handleCropConfirm = async (data: CropAreaData) => {
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
        className='cursor-pointer w-11 h-11 rounded-full border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors shrink-0 overflow-hidden relative group outline-none'
      >
        {previewUrl ? (
          <img src={previewUrl} alt={tg.avatarAlt} className='w-full h-full object-cover' />
        ) : (
          <Camera className='w-5 h-5' />
        )}
        <div className='cursor-pointer absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity'>
          <Camera className='w-4 h-4 text-white' />
        </div>
      </button>
    </div>
  )

  const hasSearchResults = (searchData?.pages[0]?.data?.length ?? 0) > 0

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

          {!conversationId && (
            <div className='p-4 space-y-3 bg-background shrink-0'>
              <div className='flex items-center gap-3'>
                {previewUrl ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>{AvatarButton}</DropdownMenuTrigger>
                    <DropdownMenuContent align='start' className='w-48'>
                      <DropdownMenuItem
                        onClick={triggerFileInput}
                        className='cursor-pointer py-2 text-[14px] text-foreground'
                      >
                        {tg.changeAvatar}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleRemoveAvatar}
                        className='cursor-pointer py-2 text-[14px] text-destructive'
                      >
                        {tg.removeAvatar}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  AvatarButton
                )}
                <div className='flex-1 relative overflow-hidden'>
                  <CharacterCounterInput
                    maxLength={50}
                    placeholder={tg.namePlaceholder}
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className='border-0 border-b rounded-none px-0 h-12 py-2 focus-visible:ring-0 focus-visible:border-primary shadow-none text-[15.5px] bg-transparent dark:bg-transparent placeholder:text-muted-foreground/40 w-full'
                  />
                </div>
              </div>
            </div>
          )}

          <div className='p-4 pt-2 space-y-3 bg-background shrink-0 relative z-50'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60' />
              <Input
                placeholder={tg.searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setTempSearchSelectedIds([]) // Clear temp selections on every search change to avoid "previous" selections
                }}
                className='pl-9 h-9 rounded-full bg-muted/40 border-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 text-[13.5px]'
              />
              {search && (
                <button
                  onClick={handleClearSearch}
                  className='absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-full'
                >
                  <X className='w-3.5 h-3.5 text-muted-foreground/60' />
                </button>
              )}

              {hasSearch && (
                <div className='absolute top-full left-0 right-0 bg-background border rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col max-h-[400px] z-[60] animate-in fade-in slide-in-from-top-1 duration-200 mt-1'>
                  <ScrollArea
                    className='flex-1 min-h-0'
                    viewportProps={{
                      onScroll: (e) => {
                        const t = e.currentTarget
                        if (t.scrollHeight - t.scrollTop <= t.clientHeight + 10 && hasNextPage && !isFetchingNextPage)
                          fetchNextPage()
                      }
                    }}
                  >
                    <div className='p-0 divide-y divide-border/40'>
                      {isSearchLoading && !searchData ? (
                        <div className='p-6 flex items-center justify-center'>
                          <Loader2 className='w-6 h-6 animate-spin text-primary/50' />
                        </div>
                      ) : hasSearchResults ? (
                        searchData?.pages.map((page, i) => (
                          <div key={i}>
                            {page.data.map((member) => (
                              <MemberItem
                                key={`search-${member.userId}`}
                                member={member}
                                isSelected={
                                  tempSearchSelectedIds.includes(member.userId) ||
                                  selectedFriendIds.includes(member.userId)
                                }
                                onRowClick={() => {
                                  setSelectedFriendIds((prev) => Array.from(new Set([...prev, member.userId])))
                                  handleClearSearch()
                                }}
                                onToggle={() => handleToggleFriend(member.userId)}
                              />
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className='p-8 text-center text-[14px] text-muted-foreground/60'>{tg.notAvailable}</div>
                      )}

                      {isFetchingNextPage && (
                        <div className='p-2 text-center text-[10px] text-muted-foreground'>{text.loading}</div>
                      )}

                      {tempSearchSelectedIds.length > 1 && (
                        <div className='px-4 py-3 sticky bottom-0 bg-background border-t flex items-center justify-center z-20'>
                          <Button
                            variant='secondary-blue'
                            className='w-full h-10'
                            onClick={(e) => {
                              e.stopPropagation()
                              handleConfirmSearchSelection()
                            }}
                          >
                            {tg.confirmSelection} ({tempSearchSelectedIds.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>

          <div className='flex-1 min-h-0 border-t bg-background overflow-hidden relative'>
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
                      const t = e.currentTarget
                      if (t.scrollHeight - t.scrollTop <= t.clientHeight + 10 && hasNextPage && !isFetchingNextPage)
                        fetchNextPage()
                    }
                  }}
                >
                  <div className='p-0'>
                    {directoryData &&
                      Object.entries(directoryData)
                        .filter(([letter]) => letter !== 'Recently' && letter !== 'Trò chuyện gần đây')
                        .map(
                          ([letter, members]) =>
                            members.length > 0 && (
                              <div key={letter}>
                                <div className='px-4 pt-2 pb-1 text-[13px] font-bold text-primary bg-background sticky top-0 z-10'>
                                  {letter}
                                </div>
                                {members.map((member) => (
                                  <MemberItem
                                    key={member.userId}
                                    member={member}
                                    isSelected={selectedFriendIds.includes(member.userId)}
                                    onRowClick={() =>
                                      setSelectedFriendIds((prev) => Array.from(new Set([...prev, member.userId])))
                                    }
                                    onToggle={() => handleToggleFriend(member.userId)}
                                  />
                                ))}
                              </div>
                            )
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
              {conversationId ? tg.confirm : tg.create}
              {(createGroupMutation.isPending || addMembersMutation.isPending) && (
                <Loader2 className='ml-2 h-4 w-4 animate-spin shrink-0' />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BaseDialog
        open={isCancelConfirmOpen}
        onOpenChange={setIsCancelConfirmOpen}
        title={tg.confirmCancelTitle}
        description={tg.confirmCancelDescription}
        confirmText={tg.yes}
        cancelText={tg.no}
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
