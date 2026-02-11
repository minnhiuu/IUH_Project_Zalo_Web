import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useSearchText } from '../i18n/use-search-text'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSearchUser } from '../queries/use-queries'
import { SearchEmpty } from '@/components/common/search-empty'
import { useDebounce } from '@/hooks/use-debounce'
import { OthersProfileDialog } from '@/features/user'
import { storage, STORAGE_KEYS } from '@/utils/local-storage'
import { type RecentSearch } from '../schemas/search.schema'
import { getCurrentTimestamp } from '@/utils/date'
import { ClearSearchConfirmDialog } from './clear-search-confirm-dialog'

interface SearchPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchPanel({ open, onOpenChange }: SearchPanelProps) {
  const [searchValue, setSearchValue] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(
    () => storage.get<RecentSearch[]>(STORAGE_KEYS.RECENT_SEARCHES, []) || []
  )
  const debouncedKeyword = useDebounce(searchValue, 500)
  const { text } = useSearchText()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isFetching } =
    useSearchUser(debouncedKeyword)

  const searchResults = data?.pages.flatMap((page) => page.data) || []
  const isSearching = searchValue !== '' && (isLoading || isFetching || searchValue !== debouncedKeyword)

  const saveRecent = (updated: RecentSearch[]) => {
    setRecentSearches(updated)
    storage.set(STORAGE_KEYS.RECENT_SEARCHES, updated)
  }

  const addToRecent = (item: RecentSearch) => {
    const updated = [item, ...recentSearches.filter((s) => s.id !== item.id)].slice(0, 10)
    saveRecent(updated)
  }

  const removeFromRecent = (id: string) => {
    const updated = recentSearches.filter((s) => s.id !== id)
    saveRecent(updated)
  }

  const clearAllRecent = () => {
    saveRecent([])
  }

  const handleSelectItem = (item: { id: string; fullName: string; avatar?: string }) => {
    addToRecent({
      id: item.id,
      type: 'user',
      displayName: item.fullName,
      avatar: item.avatar,
      timestamp: getCurrentTimestamp()
    })
    setSelectedUserId(item.id)
  }

  const handleSearchConfirm = () => {
    if (!searchValue.trim()) return
    addToRecent({
      id: `kw-${searchValue.trim()}`,
      type: 'keyword',
      displayName: searchValue.trim(),
      timestamp: getCurrentTimestamp()
    })
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 z-50 w-[344px] bg-background border-r border-border flex flex-col transition-transform duration-300 ease-in-out shadow-[2px_0_5px_rgba(0,0,0,0.05)]',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ left: '64px' }}
      >
        <div className='flex items-center gap-2 px-4 py-3 shrink-0 bg-background'>
          <div className='relative flex-1 group'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary' />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchConfirm()}
              placeholder={text.placeholder}
              className='h-9 pl-10 pr-8 bg-muted border-none rounded-sm focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 text-sm'
              autoFocus
            />
            {searchValue && (
              <Button
                variant='icon-circle'
                size='icon'
                onClick={() => setSearchValue('')}
                className='absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 p-0'
              >
                <X className='size-2.5 text-background' strokeWidth={2} />
              </Button>
            )}
          </div>
          <Button
            variant='ghost'
            onClick={() => {
              onOpenChange(false)
              setSearchValue('')
            }}
            className='text-[15px] font-semibold whitespace-nowrap h-9 hover:bg-accent-hover rounded-[4px] px-3'
          >
            {text.close}
          </Button>
        </div>

        <div className='flex-1 flex flex-col overflow-hidden'>
          <div className='flex-1 overflow-y-auto px-1'>
            {isSearching ? (
              <div className='space-y-2 px-2'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-3 px-3 py-2.5'>
                    <Skeleton className='w-12 h-12 rounded-full shrink-0' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-3 w-1/2' />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchValue === '' ? (
              <div className='flex flex-col h-full'>
                {recentSearches.length > 0 ? (
                  <>
                    <div className='flex items-center justify-between px-4 py-3'>
                      <h3 className='text-[15px] font-bold text-foreground'>{text.recent}</h3>
                      <Button
                        variant='ghost'
                        onClick={() => setIsClearDialogOpen(true)}
                        className='text-sm font-semibold text-primary hover:bg-transparent p-0 h-auto'
                      >
                        {text.clearAll}
                      </Button>
                    </div>
                    <div className='flex-1'>
                      {recentSearches.map((item) => (
                        <div
                          key={item.id}
                          className='flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors rounded-lg mx-2 my-0.5 group relative'
                          onClick={() => {
                            if (item.type === 'user') {
                              handleSelectItem({
                                id: item.id,
                                fullName: item.displayName,
                                avatar: item.avatar
                              })
                            } else {
                              setSearchValue(item.displayName)
                              addToRecent(item)
                            }
                          }}
                        >
                          {item.type === 'user' ? (
                            <UserAvatar src={item.avatar} name={item.displayName} className='w-10 h-10' />
                          ) : (
                            <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
                              <Search className='w-5 h-5 text-muted-foreground' />
                            </div>
                          )}
                          <div className='flex-1 min-w-0'>
                            <span className='text-sm text-foreground font-medium truncate block'>
                              {item.displayName}
                            </span>
                          </div>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFromRecent(item.id)
                            }}
                            className='w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity'
                          >
                            <X className='w-4 h-4 text-muted-foreground' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <>
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className='flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors rounded-lg mx-2 my-0.5 group relative'
                  >
                    <UserAvatar src={item.avatar} name={item.fullName} className='w-12 h-12' />
                    <div className='flex flex-col min-w-0'>
                      <span className='text-base text-foreground font-medium truncate'>{item.fullName}</span>
                    </div>
                  </div>
                ))}
                {searchResults.length === 0 && !isFetching && (
                  <SearchEmpty title={text.noResult} description={text.noResultDescription} />
                )}

                {hasNextPage && (
                  <div className='p-2 flex justify-center'>
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className='w-full rounded-sm'
                    >
                      {isFetchingNextPage ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Xem thêm'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className='mx-4 mt-2 border-t border-section-divider shrink-0' />
        </div>
        <OthersProfileDialog
          userId={selectedUserId}
          open={!!selectedUserId}
          onOpenChange={(open) => !open && setSelectedUserId(undefined)}
        />
      </div>

      <ClearSearchConfirmDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
        onConfirm={clearAllRecent}
      />
    </>
  )
}
