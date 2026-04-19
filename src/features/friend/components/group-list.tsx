import { useState, useRef, useCallback } from 'react'
import { Search, X, Users, Filter, ArrowUpDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchEmpty } from '@/components/common/search-empty'
import { GroupListItem } from './group-list-item'
import { useFriendText } from '../i18n/use-friend-text'
import { useMyGroupsQuery } from '@/features/chat/queries/use-queries'
import { useNavigate } from 'react-router'
import type { ConversationResponse } from '@/features/chat/schemas/chat.schema'
import type { GroupSortOption, GroupFilterOption } from '@/features/chat/api/chat.api'
import { ContactPageLayout } from './contact-page-layout'

export function GroupList() {
  const { text } = useFriendText()
  const navigate = useNavigate()

  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sort, setSort] = useState<GroupSortOption>('activity_newest')
  const [filter, setFilter] = useState<GroupFilterOption>('all')
  const [page] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 300)
  }, [])

  const { data, isLoading } = useMyGroupsQuery(debouncedQuery, sort, filter, page)

  const groups: ConversationResponse[] = data?.data ?? []
  const totalItems = data?.totalItems ?? 0

  const handleOpenChat = (group: ConversationResponse) => {
    navigate(`/chat/c/${group.id}`)
  }

  return (
    <ContactPageLayout title={text.groupList.title} icon={Users} categoryTitle={text.groupList.count(totalItems)}>
      <div className='flex flex-col bg-background rounded-xl border border-divider-bold overflow-hidden mb-4 shrink-0'>
        {/* Unified Filter Area - Matched with FriendList */}
        <div className='bg-background border-b border-divider px-4 py-3 flex items-center gap-2'>
          <div className='relative group flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/60 group-focus-within:text-primary transition-colors' />
            <Input
              type='text'
              placeholder={text.groupList.searchPlaceholder}
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className='pl-9 pr-8 h-[32px] w-full bg-(--input-field-bg-outline) border-border/40 rounded-[6px] text-[13px] placeholder:text-text-secondary/60 focus-visible:ring-1 focus-visible:ring-primary/20 transition-all'
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('')
                  setDebouncedQuery('')
                }}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
            )}
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            {/* Sort Chip */}
            <Select value={sort} onValueChange={(v) => setSort(v as GroupSortOption)}>
              <SelectTrigger className='h-[30px] min-w-[140px] px-3 border border-border/40 bg-(--input-field-bg-outline) text-[13px] font-normal rounded-[5px] text-(--button-secondary-neutral-text) hover:bg-muted/30 transition-colors gap-2 shadow-none focus:ring-0'>
                <ArrowUpDown className='w-3.5 h-3.5 shrink-0 opacity-70' />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align='end'>
                <SelectItem value='activity_newest' className='text-[13px]'>
                  {text.groupList.sortOptions.activityNewest}
                </SelectItem>
                <SelectItem value='activity_oldest' className='text-[13px]'>
                  {text.groupList.sortOptions.activityOldest}
                </SelectItem>
                <SelectItem value='name_asc' className='text-[13px]'>
                  {text.groupList.sortOptions.nameAsc}
                </SelectItem>
                <SelectItem value='name_desc' className='text-[13px]'>
                  {text.groupList.sortOptions.nameDesc}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Chip */}
            <Select value={filter} onValueChange={(v) => setFilter(v as GroupFilterOption)}>
              <SelectTrigger className='h-[30px] px-3 border border-border/40 bg-(--input-field-bg-outline) text-[13px] font-normal rounded-[5px] text-(--button-secondary-neutral-text) hover:bg-muted/30 transition-colors shadow-none focus:ring-0 gap-2'>
                <Filter className='w-3.5 h-3.5 shrink-0 opacity-70' />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align='end'>
                <SelectItem value='all' className='text-[13px]'>
                  {text.groupList.filterOptions.all}
                </SelectItem>
                <SelectItem value='owner' className='text-[13px]'>
                  {text.groupList.filterOptions.owner}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex flex-col'>
          {isLoading ? (
            <div className='p-4 space-y-3'>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className='flex items-center gap-3 px-2 py-2'>
                  <Skeleton className='w-10 h-10 rounded-full shrink-0' />
                  <div className='flex-1 space-y-1.5'>
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-3 w-1/3' />
                  </div>
                </div>
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className='flex items-center justify-center min-h-[400px]'>
              <SearchEmpty title={debouncedQuery ? text.groupList.noResults : text.groupList.noGroups} />
            </div>
          ) : (
            <div className='px-4 py-0 divide-y divide-border/40'>
              {groups.map((group) => (
                <GroupListItem key={group.id} group={group} onOpenChat={handleOpenChat} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ContactPageLayout>
  )
}
