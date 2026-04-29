import { Search, X } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { SearchType } from '@/constants/enum'
import { useRecentHistory, useAddSearchItem, useRemoveSearchItem, useClearAllSearchHistory } from '../queries/use-recent-queries'
import { useState } from 'react'
import { ClearSearchConfirmDialog } from '../../shared/components/clear-search-confirm-dialog'

interface RecentSearchListProps {
  recentTitle: string
  noRecentText: string
  clearAllText: string
  onSelectKeyword: (keyword: string) => void
  onSelectUser: (user: { id: string; fullName: string; avatar?: string }) => void
}

export function RecentSearchList({ 
  recentTitle, 
  noRecentText, 
  clearAllText, 
  onSelectKeyword, 
  onSelectUser 
}: RecentSearchListProps) {
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const { data: recentHistory } = useRecentHistory()
  const { mutate: addSearchItem } = useAddSearchItem()
  const { mutate: removeItem } = useRemoveSearchItem()
  const { mutate: clearAll, isPending: isClearing } = useClearAllSearchHistory()

  const recentSearches = [...(recentHistory?.items || []), ...(recentHistory?.queries || [])].sort(
    (a, b) => b.timestamp - a.timestamp
  )

  if (recentSearches.length === 0) {
    return <div className='px-7 py-8 text-sm text-muted-foreground italic text-center w-full'>{noRecentText}</div>
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center justify-between px-4 py-3'>
        <h3 className='text-[15px] font-bold text-foreground'>{recentTitle}</h3>
        <Button
          variant='ghost'
          onClick={() => setIsClearDialogOpen(true)}
          className='text-sm font-semibold text-primary hover:bg-transparent p-0 h-auto'
        >
          {clearAllText}
        </Button>
      </div>
      <div className='flex-1'>
        {recentSearches.map((item) => (
          <div
            key={item.id}
            className='flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors rounded-lg mx-2 my-0.5 group relative'
            onClick={() => {
              addSearchItem({ id: item.id, name: item.name, avatar: item.avatar, type: item.type })
              if (item.type === SearchType.User || item.type === SearchType.Group) {
                onSelectUser({ id: item.id, fullName: item.name, avatar: item.avatar })
              } else {
                onSelectKeyword(item.name)
              }
            }}
          >
            {item.type === SearchType.User || item.type === SearchType.Group ? (
              <UserAvatar src={item.avatar} name={item.name} className='w-10 h-10' />
            ) : (
              <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
                <Search className='w-5 h-5 text-muted-foreground' />
              </div>
            )}
            <div className='flex-1 min-w-0'>
              <span className='text-sm text-foreground font-medium truncate block'>{item.name}</span>
            </div>
            <Button
              variant='ghost'
              size='icon'
              onClick={(e) => {
                e.stopPropagation()
                removeItem({ id: item.id, type: item.type })
              }}
              className='w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded-full text-text-secondary/60 hover:text-text-primary'
            >
              <X className='w-full h-full' />
            </Button>
          </div>
        ))}
      </div>

      <ClearSearchConfirmDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
        onConfirm={() => clearAll()}
        isPending={isClearing}
      />
    </div>
  )
}
