import { useState, useMemo } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  useFriendsDirectory,
  useSearchMembersInfinite,
  useAdminCandidatesInfiniteQuery
} from '../../../queries/use-queries'
import { MemberItem } from '../members/member-item'
import { SelectedMemberSidebar } from '../members/selected-member-sidebar'
import type { SearchMemberResponse, AdminMemberResponse } from '../../../schemas/chat.schema'
import { useChatText } from '../../../i18n/use-chat-text'
import { cn } from '@/lib/utils'
import type { PageResponse } from '@/shared/api'

interface MemberSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  confirmText: string
  onConfirm: (selectedIds: string[]) => void
  conversationId?: string | null
  maxSelection?: number
  isPending?: boolean
  initialSelectedIds?: string[]
  singleSelection?: boolean
  staticMembers?: SearchMemberResponse[]
  type?: 'friends' | 'admin-candidates'
}

export function MemberSelectionDialog({ isOpen, onClose, ...props }: MemberSelectionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className='p-0 gap-0 rounded-[8px] sm:max-w-[550px] w-full border-none shadow-xl overflow-hidden h-[620px] flex flex-col focus:outline-none'
        showCloseButton={false}
      >
        {isOpen && <MemberSelectionContent onClose={onClose} {...props} />}
      </DialogContent>
    </Dialog>
  )
}

function MemberSelectionContent({
  onClose,
  title,
  confirmText,
  onConfirm,
  conversationId,
  maxSelection = 100,
  isPending = false,
  initialSelectedIds = [],
  singleSelection = false,
  staticMembers,
  type = 'friends'
}: Omit<MemberSelectionDialogProps, 'isOpen'>) {
  const { text } = useChatText()
  const tg = text['create-group-dialog']

  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds)

  const { data: friendsData } = useFriendsDirectory(conversationId, !staticMembers && type === 'friends')
  const { data: searchData } = useSearchMembersInfinite(
    search,
    conversationId,
    !!search && !staticMembers && type === 'friends'
  )
  const { data: adminCandidatesData } = useAdminCandidatesInfiniteQuery(
    conversationId!,
    search,
    !staticMembers && type === 'admin-candidates'
  )

  const friends = useMemo(() => {
    if (!friendsData) return []
    return Object.values(friendsData).flat()
  }, [friendsData])

  const searchResults = useMemo(() => {
    if (!searchData) return []
    return searchData.pages.flatMap((page: PageResponse<SearchMemberResponse>) => page.data || [])
  }, [searchData])

  const filteredStaticMembers = useMemo(() => {
    if (!staticMembers) return []
    if (!search.trim()) return staticMembers
    const s = search.toLowerCase()
    return staticMembers.filter((m) => m.fullName.toLowerCase().includes(s))
  }, [staticMembers, search])

  const adminCandidates = useMemo(() => {
    if (!adminCandidatesData) return []
    return adminCandidatesData.pages.flatMap((page) =>
      (page.data || []).map((m: AdminMemberResponse) => ({
        userId: m.userId,
        fullName: m.fullName,
        avatar: m.avatar,
        isAlreadyMember: m.role === 'ADMIN'
      }))
    ) as SearchMemberResponse[]
  }, [adminCandidatesData])

  const displayMembers = useMemo(() => {
    if (staticMembers) return filteredStaticMembers
    if (type === 'admin-candidates') return adminCandidates
    return search ? searchResults : friends
  }, [staticMembers, filteredStaticMembers, search, searchResults, friends, type, adminCandidates])

  const selectedMembers = useMemo(() => {
    const allAvailable: SearchMemberResponse[] = staticMembers
      ? staticMembers
      : [...friends, ...searchResults, ...adminCandidates]
    return selectedIds
      .map((id) => allAvailable.find((member) => member.userId === id))
      .filter((member): member is SearchMemberResponse => !!member)
      .filter((member, index, self) => self.findIndex((target) => target.userId === member.userId) === index)
  }, [staticMembers, friends, searchResults, adminCandidates, selectedIds])

  const handleToggle = (userId: string) => {
    if (singleSelection) {
      setSelectedIds([userId])
      return
    }
    setSelectedIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleRemoveSelected = (userId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== userId))
  }

  const handleConfirmClick = () => {
    onConfirm(selectedIds)
  }

  const isConfirmDisabled = selectedIds.length === 0 || isPending
  const showSidebar = !singleSelection && selectedIds.length > 0

  return (
    <>
      <DialogHeader className='px-4 h-[56px] flex flex-row items-center justify-between border-b bg-background shrink-0 space-y-0'>
        <DialogTitle className='text-[17px] font-semibold'>{title}</DialogTitle>
        <DialogClose asChild>
          <button
            onClick={onClose}
            className='p-1.5 hover:bg-muted rounded-full transition-colors cursor-pointer outline-none'
          >
            <X className='w-5 h-5 text-muted-foreground/80' />
          </button>
        </DialogClose>
      </DialogHeader>

      <div className='p-4 space-y-3 bg-background shrink-0'>
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

      <div className='flex-1 min-h-0 border-t bg-background overflow-hidden'>
        <div className='flex h-full min-h-0'>
          <div
            className={cn(
              'flex flex-col flex-1 min-h-0 border-r bg-background transition-all duration-300 relative overflow-hidden'
            )}
          >
            <ScrollArea className='h-full'>
              <div className='p-0'>
                {displayMembers.length > 0 ? (
                  displayMembers.map((member) => (
                    <MemberItem
                      key={member.userId}
                      member={member}
                      isSelected={selectedIds.includes(member.userId)}
                      onToggle={() => handleToggle(member.userId)}
                      selectionMode={singleSelection ? 'radio' : 'checkbox'}
                      showSubtitle={type !== 'admin-candidates'}
                    />
                  ))
                ) : (
                  <div className='flex flex-col items-center justify-center p-12 text-center'>
                    <div className='w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-3 text-empty-state-icon'>
                      <Search className='w-8 h-8' />
                    </div>
                    <p className='text-[14px] text-muted-foreground/60 font-medium'>
                      {search ? tg.noResultsFound : staticMembers ? 'No members found' : tg.noFriendsFound}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {showSidebar && (
            <div className='w-[210px] h-full shrink-0 p-2.5 pb-2 pl-1 bg-background animate-in fade-in slide-in-from-right-4 duration-300 border-l'>
              <SelectedMemberSidebar
                selectedFriends={selectedMembers}
                onRemove={handleRemoveSelected}
                selectedCount={selectedIds.length}
                totalLimit={maxSelection}
                title={text['create-group-dialog'].selected}
              />
            </div>
          )}
        </div>
      </div>

      <div className='p-3 px-4 border-t flex items-center justify-end gap-3 bg-background shrink-0'>
        <button
          onClick={onClose}
          className='font-bold h-10 px-6 rounded-[4px] bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors'
        >
          {tg.cancel}
        </button>
        <Button
          onClick={handleConfirmClick}
          disabled={isConfirmDisabled}
          variant={isConfirmDisabled ? 'disabled' : 'default'}
          className='min-w-[100px] h-10 font-bold px-6 rounded-[4px]'
        >
          {confirmText}
          {isPending && <Loader2 className='ml-2 h-4 w-4 animate-spin shrink-0' />}
        </Button>
      </div>
    </>
  )
}
