import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { UserAvatar } from '@/components/common/user-avatar'
import { useMyFriends } from '@/features/friend'
import { useChatText } from '../i18n/use-chat-text'

export interface BusinessCardAsset {
  userId: string
  name: string
  phone?: string
  avatar?: string | null
  includePhone?: boolean
}

interface BusinessCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (cards: BusinessCardAsset[]) => void
}

type FriendItem = {
  userId: string
  userName: string
  userAvatar?: string | null
  userPhone?: string | null
}

function getDisplayLetter(name: string): string {
  const firstChar = name.charAt(0).toUpperCase()
  if (/[A-Z]/.test(firstChar)) return firstChar
  const normalized = firstChar.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
  if (/[A-Z]/.test(normalized)) return normalized
  return '#'
}

export function BusinessCardDialog({ open, onOpenChange, onSend }: BusinessCardDialogProps) {
  const { text } = useChatText()
  const bc = text.businessCard
  const { data: rawFriends = [] } = useMyFriends(0, 300, open)
  const friends = (rawFriends || []) as FriendItem[]

  const [query, setQuery] = useState('')
  const [includePhone, setIncludePhone] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const sorted = [...friends].sort((a, b) => (a.userName || '').localeCompare(b.userName || '', 'vi'))
    if (!normalized) return sorted

    return sorted.filter((friend) => {
      const n = (friend.userName || '').toLowerCase()
      const p = (friend.userPhone || '').toLowerCase()
      return n.includes(normalized) || p.includes(normalized)
    })
  }, [friends, query])

  const grouped = useMemo(() => {
    const groups: Record<string, FriendItem[]> = {}
    filtered.forEach((friend) => {
      const letter = getDisplayLetter(friend.userName || 'User')
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(friend)
    })
    return groups
  }, [filtered])

  const letters = useMemo(
    () => Object.keys(grouped).sort((a, b) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b, 'vi'))),
    [grouped]
  )

  const resetState = () => {
    setQuery('')
    setIncludePhone(true)
    setSelectedIds([])
  }

  const closeDialog = (nextOpen: boolean) => {
    if (!nextOpen) resetState()
    onOpenChange(nextOpen)
  }

  const toggleSelected = (userId: string) => {
    setSelectedIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const selectedFriends = useMemo(() => {
    const selected = new Set(selectedIds)
    return friends.filter((friend) => selected.has(friend.userId))
  }, [friends, selectedIds])

  const handleSend = () => {
    if (!selectedIds.length) return

    const selected = new Set(selectedIds)
    const cardsByUserId = new Map<string, BusinessCardAsset>()
    friends
      .filter((friend) => selected.has(friend.userId))
      .forEach((friend) => {
        if (!friend.userId || cardsByUserId.has(friend.userId)) return
        cardsByUserId.set(friend.userId, {
        userId: friend.userId,
        name: friend.userName || text.user,
        phone: includePhone ? friend.userPhone || '' : '',
        avatar: friend.userAvatar || null,
        includePhone
        })
      })

    const cards = Array.from(cardsByUserId.values())
    if (!cards.length) return

    onSend(cards)
    closeDialog(false)
  }

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className='w-[min(96vw,920px)]! max-w-230! sm:max-w-230! p-0 gap-0 overflow-hidden rounded-xl border border-border bg-background'>
        <DialogHeader className='px-5 h-16 border-b flex flex-row items-center justify-between space-y-0'>
          <DialogTitle className='text-[21px] font-bold text-foreground'>{bc.title}</DialogTitle>
          <DialogClose asChild>
            <button className='p-2 rounded-md text-foreground/80 hover:bg-muted'>
              <X size={20} />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className='px-5 pt-4 pb-3 border-b'>
          <div className='relative'>
            <Search size={18} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={bc.searchPlaceholder}
              className='h-10 rounded-full pl-10 border-primary/70 bg-background focus-visible:ring-primary'
            />
          </div>

          <div className='mt-3 flex items-center gap-2 overflow-auto no-scrollbar'>
            {[bc.chipAll, bc.chipCustomer, bc.chipFamily, bc.chipWork, bc.chipFriends, bc.chipLater].map((label, idx) => (
              <button
                key={label}
                type='button'
                className={`px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap ${idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {label}
              </button>
            ))}
            <button type='button' className='w-8 h-8 rounded-full border border-border bg-background text-muted-foreground shrink-0'>
              {'>'}
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] min-h-125'>
          <ScrollArea className='h-125 px-3 border-r border-border min-w-0'>
            <div className='py-2'>
              {letters.map((letter) => (
                <div key={letter}>
                  <div className='px-2 py-1 text-sm font-semibold text-foreground/80 sticky top-0 bg-background z-10'>{letter}</div>
                  {grouped[letter].map((friend) => {
                    const checked = selectedIds.includes(friend.userId)
                    return (
                      <button
                        key={friend.userId}
                        type='button'
                        onClick={() => toggleSelected(friend.userId)}
                        className='w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/60 text-left'
                      >
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${checked ? 'border-primary bg-primary' : 'border-border bg-background'}`}
                        >
                          {checked ? <span className='w-2 h-2 rounded-full bg-white' /> : null}
                        </span>
                        <UserAvatar src={friend.userAvatar || undefined} name={friend.userName || text.user} className='w-10 h-10' />
                        <div className='min-w-0'>
                          <div className='text-[17px]/[1.2] text-foreground truncate'>{friend.userName || text.user}</div>
                          {friend.userPhone ? <div className='text-sm text-muted-foreground'>{friend.userPhone}</div> : null}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))}
              {letters.length === 0 ? <div className='py-10 text-center text-sm text-muted-foreground'>{bc.empty}</div> : null}
            </div>
          </ScrollArea>

          <div className='hidden md:flex flex-col h-125 bg-background min-w-0'>
            <div className='m-3 border border-border rounded-md p-3 bg-background'>
              <div className='text-sm font-semibold text-foreground'>
                {bc.selectedTitle} <span className='text-primary'>{selectedIds.length}/9</span>
              </div>

              <div className='mt-3 flex flex-wrap gap-2'>
                {selectedFriends.map((friend) => (
                  <div key={friend.userId} className='flex items-center gap-1.5 rounded-full bg-primary/10 text-primary pl-1.5 pr-2 py-1'>
                    <UserAvatar src={friend.userAvatar || undefined} name={friend.userName || text.user} className='w-5 h-5' />
                    <span className='text-[13px] max-w-27 truncate'>{friend.userName || text.user}</span>
                    <button
                      type='button'
                      onClick={() => toggleSelected(friend.userId)}
                      className='w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] leading-none'
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className='mt-auto border-t border-border p-3'>
              <label className='flex items-center gap-2 text-[14px] text-foreground leading-tight'>
                <Switch checked={includePhone} onCheckedChange={setIncludePhone} />
                <span className='min-w-0 wrap-break-word'>{bc.includePhone}</span>
              </label>
            </div>
          </div>
        </div>

        <div className='border-t px-4 py-4 bg-background'>
          <div className='md:hidden mb-3'>
            <label className='flex items-center gap-2 text-[14px] text-foreground'>
              <Switch checked={includePhone} onCheckedChange={setIncludePhone} />
              {bc.includePhone}
            </label>
          </div>

          <div className='flex items-center justify-end'>
            <div className='flex items-center gap-3'>
              <Button type='button' variant='secondary' onClick={() => closeDialog(false)}>
                {bc.cancel}
              </Button>
              <Button type='button' className='min-w-35' onClick={handleSend} disabled={!selectedIds.length}>
                {bc.send}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
