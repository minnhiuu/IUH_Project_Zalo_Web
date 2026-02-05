import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useSearchText } from '../i18n/use-search-text'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'

interface SearchPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MOCK_RESULTS = [
  {
    id: '1',
    name: 'AI',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AI'
  },
  {
    id: '2',
    name: 'tml',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tml'
  },
  {
    id: '3',
    name: 'péo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=peo'
  },
  {
    id: '4',
    name: 'Hoàng Huy',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Huy'
  },
  {
    id: '5',
    name: 'Xuân Hồ',
    avatar: ''
  }
]

export function SearchPanel({ open, onOpenChange }: SearchPanelProps) {
  const [searchValue, setSearchValue] = useState('')
  const { text } = useSearchText()

  return (
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
          onClick={() => onOpenChange(false)}
          className='text-[15px] font-semibold whitespace-nowrap h-9 hover:bg-accent-hover rounded-[4px] px-3'
        >
          {text.close}
        </Button>
      </div>

      <div className='flex-1 flex flex-col overflow-hidden'>
        <div className='px-4 py-3 shrink-0'>
          <h3 className='text-[15px] font-bold text-foreground'>{text.recentHeader}</h3>
        </div>

        <div className='flex-1 overflow-y-auto px-1'>
          {MOCK_RESULTS.map((item) => (
            <div
              key={item.id}
              className='flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors rounded-lg mx-2 my-0.5 group relative'
            >
              <UserAvatar src={item.avatar} name={item.name} className='w-12 h-12' />
              <div className='flex flex-col min-w-0'>
                <span className='text-base text-foreground font-medium truncate'>{item.name}</span>
              </div>
              <div className='ml-auto opacity-0 group-hover:opacity-100 transition-opacity'>
                <X className='w-4 h-4 text-muted-foreground hover:text-icon-hover' />
              </div>
            </div>
          ))}
        </div>

        <div className='mx-4 mt-2 border-t border-section-divider shrink-0' />
      </div>
    </div>
  )
}
