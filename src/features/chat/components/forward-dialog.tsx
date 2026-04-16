import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { UserAvatar } from '@/components/common/user-avatar'
import { useConversationsQuery, useMyGroupsQuery } from '../queries/use-queries'
import { useMyFriendsInfinite } from '@/features/friend'
import { useAuth } from '@/features/auth'
import { getConversationDisplayName } from '../utils/group-name'
import type { ConversationResponse, MessageResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'

type TabType = 'recent' | 'groups' | 'friends'

interface SelectedConvEntry {
  id: string
  name: string
  avatar?: string | null
}

interface ForwardDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  confirmText?: string
  cancelText?: string
  onConfirm: (selectedConvIds: string[], description?: string) => void
  message?: MessageResponse
}

export function ForwardDialog({
  open,
  onClose,
  title,
  confirmText,
  cancelText,
  onConfirm,
  message
}: ForwardDialogProps) {
  const { text } = useChatText()
  const [description, setDescription] = useState('')
  const tf = text['forward-dialog']
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('recent')

  const dialogTitle = title ?? tf.title
  const confirmLabel = confirmText ?? tf.share
  const cancelLabel = cancelText ?? tf.cancel

  const { data: conversations } = useConversationsQuery(open)
  const { data: myGroupsPage } = useMyGroupsQuery(
    activeTab === 'groups' ? search : '',
    'activity_newest',
    'all',
    0,
    100,
    open && activeTab === 'groups'
  )
  const myGroups = myGroupsPage?.data || []

  const { data: myFriendsPage } = useMyFriendsInfinite(100, open && activeTab === 'friends')
  const myFriends = useMemo(() => {
    return myFriendsPage?.pages.flatMap((p) => p.data) || []
  }, [myFriendsPage])

  const { user } = useAuth()

  // Map to find conversation by friend userId to avoid "fake" IDs if conversation already exists
  const conversationByPartnerId = useMemo(() => {
    const map = new Map<string, string>()
    if (!conversations) return map
    conversations.forEach((c) => {
      if (!c.isGroup && c.recipientId) {
        map.set(c.recipientId, c.id)
      }
    })
    return map
  }, [conversations])

  type ForwardEntry =
    | ConversationResponse
    | {
        id: string
        name: string
        avatar?: string | null
        lastMessage?: ConversationResponse['lastMessage']
      }

  const filteredConversations = useMemo(() => {
    let baseItems: ForwardEntry[] = []

    if (activeTab === 'groups') {
      baseItems = myGroups || []
    } else if (activeTab === 'friends') {
      baseItems = myFriends.map((f) => {
        const existingConvId = conversationByPartnerId.get(f.userId)
        return {
          id: existingConvId || `fake_${f.userId}`,
          name: f.userName,
          avatar: f.userAvatar
        }
      })
    } else {
      if (!conversations) return []
      baseItems = conversations
    }

    const getEntryNameInternal = (item: ForwardEntry) => {
      if ('name' in item && item.name) return item.name as string
      return getConversationDisplayName(item as ConversationResponse, 'Conversation', undefined, user?.id)
    }

    const q = search.toLowerCase().trim()
    const searchFiltered = q
      ? baseItems.filter((c) => {
          const name = getEntryNameInternal(c)
          return name.toLowerCase().includes(q)
        })
      : baseItems

    // Sort: Recent tab by activity, Friends tab by name
    return [...searchFiltered].sort((a, b) => {
      if (activeTab === 'friends') {
        const nameA = getEntryNameInternal(a)
        const nameB = getEntryNameInternal(b)
        return nameA.localeCompare(nameB)
      }
      const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0
      const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0
      return timeB - timeA
    })
  }, [conversations, myGroups, myFriends, search, user?.id, activeTab, conversationByPartnerId])

  const selectedEntries = useMemo<SelectedConvEntry[]>(() => {
    const result: SelectedConvEntry[] = []
    const allItems = new Map<string, { name: string; avatar?: string | null }>()

    // Add items from all sources to a flat map for lookup
    conversations?.forEach((c) => {
      allItems.set(c.id, {
        name: getConversationDisplayName(c, 'Conversation', undefined, user?.id),
        avatar: c.avatar
      })
    })

    myGroups?.forEach((g) => {
      allItems.set(g.id, {
        name: g.name || 'Group',
        avatar: g.avatar
      })
    })

    myFriends?.forEach((f) => {
      const existingConvId = conversationByPartnerId.get(f.userId)
      allItems.set(existingConvId || `fake_${f.userId}`, {
        name: f.userName,
        avatar: f.userAvatar
      })
    })

    for (const id of selectedIds) {
      const entry = allItems.get(id)
      if (entry) {
        result.push({ id, ...entry })
      }
    }
    return result
  }, [selectedIds, conversations, myGroups, myFriends, user?.id, conversationByPartnerId])

  const getEntryName = (item: ForwardEntry) => {
    if ('name' in item && item.name) return item.name as string
    return getConversationDisplayName(item as ConversationResponse, 'Conversation', undefined, user?.id)
  }

  const handleToggle = (convId: string) => {
    setSelectedIds((prev) =>
      prev.includes(convId) ? prev.filter((id) => id !== convId) : prev.length < 100 ? [...prev, convId] : prev
    )
  }

  const handleRemove = (convId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== convId))
  }

  const handleDeleteAll = () => {
    setSelectedIds([])
  }

  const handleConfirm = () => {
    onConfirm(selectedIds, description)
    setSelectedIds([])
    setSearch('')
    setDescription('')
    onClose()
  }

  const handleClose = () => {
    setSelectedIds([])
    setSearch('')
    setDescription('')
    onClose()
  }

  const showSidebar = selectedIds.length > 0

  const tabs: { key: TabType; label: string }[] = [
    { key: 'recent', label: tf.tabRecent },
    { key: 'groups', label: tf.tabGroups },
    { key: 'friends', label: tf.tabFriends }
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className='p-0 gap-0 rounded-[8px] sm:max-w-[600px] w-full shrink-0 outline-none border-none shadow-xl overflow-hidden h-[680px] flex flex-col'
        showCloseButton={false}
      >
        <DialogHeader className='px-4 h-[56px] flex flex-row items-center justify-between border-b bg-background shrink-0 space-y-0'>
          <DialogTitle className='text-[17px] font-semibold'>{dialogTitle}</DialogTitle>
          <DialogClose asChild>
            <button
              className='p-1.5 hover:bg-muted rounded-full transition-colors cursor-pointer outline-none'
              onClick={handleClose}
            >
              <X className='w-5 h-5 text-muted-foreground/80' />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Search */}
        <div className='p-4 pt-3 pb-3 bg-background shrink-0'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60' />
            <Input
              placeholder={tf.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-9 h-9 rounded-full bg-muted/40 border-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 text-[13.5px]'
            />
          </div>
        </div>

        {/* Tabs and Labels */}
        <div className='flex items-center justify-between px-4 pb-2 bg-background shrink-0'>
          <div className='flex items-center gap-4'>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-[13.5px] font-medium pb-1 border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 min-h-0 border-t bg-background overflow-hidden'>
          <div className='flex h-full min-h-0'>
            {/* Conversation list */}
            <div className='flex flex-col flex-1 min-h-0 overflow-hidden'>
              <ScrollArea className='h-full'>
                <div className='p-0'>
                  {filteredConversations.length === 0 ? (
                    <div className='flex flex-col items-center justify-center p-12 text-center'>
                      <div className='w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-3'>
                        <Search className='w-8 h-8 text-muted-foreground/40' />
                      </div>
                      <p className='text-[14px] text-muted-foreground/60 font-medium'>{tf.empty}</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const name = getEntryName(conv)
                      const isSelected = selectedIds.includes(conv.id)
                      return (
                        <div
                          key={conv.id}
                          onClick={() => handleToggle(conv.id)}
                          className={`flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors cursor-pointer min-w-0 ${isSelected ? 'bg-muted/30' : ''}`}
                        >
                          <div className='flex items-center justify-center w-5 h-5 shrink-0'>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggle(conv.id)}
                              className='w-4.5 h-4.5 border-muted-foreground/30'
                            />
                          </div>
                          <UserAvatar
                            name={name}
                            src={conv.avatar}
                            className='w-10 h-10 shadow-sm border border-border/10 shrink-0'
                          />
                          <div className='flex-1 min-w-0 overflow-hidden'>
                            <p className='text-[14px] font-medium text-foreground truncate'>{name}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Selected sidebar */}
            {showSidebar && (
              <div className='w-[210px] h-full shrink-0 p-2.5 pb-2 pl-1 bg-background'>
                <div className='flex flex-col border rounded-[8px] h-full overflow-hidden bg-background'>
                  <div className='p-2.5 py-1.5 flex items-center gap-1.5 whitespace-nowrap overflow-hidden shrink-0'>
                    <span className='text-[11.5px] font-bold'>{tf.selected}</span>
                    <span className='text-[10.5px] text-primary font-medium'>{selectedIds.length}/100</span>
                    <button
                      onClick={handleDeleteAll}
                      className='text-[11px] text-primary font-medium cursor-pointer hover:underline ml-auto'
                    >
                      {tf.delete}
                    </button>
                  </div>
                  <ScrollArea className='flex-1'>
                    <div className='p-1.5 space-y-1'>
                      {selectedEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className='flex items-center gap-2 p-1 px-2 rounded-full bg-background border border-border/50 group transition-colors w-full overflow-hidden min-w-0'
                        >
                          <UserAvatar name={entry.name} src={entry.avatar} className='w-6 h-6 shrink-0 shadow-sm' />
                          <div className='flex-1 min-w-0 overflow-hidden'>
                            <p className='text-[12px] font-medium truncate'>{entry.name}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemove(entry.id)
                            }}
                            className='p-0 hover:bg-transparent rounded-full flex items-center justify-center shrink-0 ml-0.5 cursor-pointer transition-transform hover:scale-110 active:scale-95'
                          >
                            <div className='w-4.5 h-4.5 bg-muted rounded-full flex items-center justify-center shadow-sm'>
                              <X className='w-3 h-3 text-muted-foreground stroke-[3.5]' />
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
        </div>

        {/* Message Preview and Description */}
        <div className='p-3.5 pt-0 pb-0 bg-background shrink-0 space-y-1'>
          <div
            className='px-3 py-2 rounded mb-3 bg-[var(--NG15)]'
            style={{ backgroundColor: 'var(--NG15)', padding: '8px 12px', margin: '12px 0', borderRadius: '4px' }}
          >
            <p className='text-[11px] font-bold text-foreground mb-1 uppercase tracking-tight'>
              {tf.forwardMessage || 'Forward message'}
            </p>
            <p className='text-[13px] text-foreground/80 overflow-hidden text-ellipsis whitespace-nowrap italic'>
              {message?.content || '...'}
            </p>
          </div>
          <div className='relative'>
            <Input
              placeholder={tf.addDescription || 'Add description...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='h-10 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/20 text-[13.5px] pr-10'
            />
          </div>
        </div>

        {/* Footer */}
        <div className='p-3 px-4 border-t flex items-center justify-end gap-3 bg-background shrink-0'>
          <Button variant='secondary' onClick={handleClose}>
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
            variant={selectedIds.length === 0 ? 'disabled' : 'default'}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
