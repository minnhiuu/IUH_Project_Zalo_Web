import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFriendText } from '../i18n/use-friend-text'

type FilterType = 'all' | 'friends' | 'requests' | 'blocked'
type SortType = 'name' | 'recent' | 'online'

interface ContactsFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filterType: FilterType
  onFilterChange: (type: FilterType) => void
  sortType: SortType
  onSortChange: (type: SortType) => void
  totalCount?: number
}

export function ContactsFilter({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  sortType,
  onSortChange,
  totalCount = 0
}: ContactsFilterProps) {
  const { text } = useFriendText()

  const filterOptions: Array<{ value: FilterType; label: string; icon?: string }> = [
    { value: 'all', label: text.contactsFilter.filterOptions.all },
    { value: 'friends', label: text.contactsFilter.filterOptions.friends },
    { value: 'requests', label: text.contactsFilter.filterOptions.requests },
    { value: 'blocked', label: text.contactsFilter.filterOptions.blocked }
  ]

  const sortOptions: Array<{ value: SortType; label: string }> = [
    { value: 'name', label: text.contactsFilter.sortOptions.nameAZ },
    { value: 'recent', label: text.contactsFilter.sortOptions.recent },
    { value: 'online', label: text.contactsFilter.sortOptions.online }
  ]

  const activeFilter = filterOptions.find((f) => f.value === filterType)
  const activeSort = sortOptions.find((s) => s.value === sortType)

  return (
    <div className='bg-background border-b border-border px-4 py-3 space-y-3'>
      {/* Search Input */}
      <div className='relative group'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
        <Input
          type='text'
          placeholder={text.contactsFilter.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className='pl-9 pr-8 h-9 w-full bg-muted border-none rounded-full text-sm focus-visible:ring-1 focus-visible:ring-primary/20'
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>

      {/* Filters and Sort */}
      <div className='flex items-center gap-2 flex-wrap'>
        {/* Filter Dropdown */}
        <Select value={filterType} onValueChange={(v) => onFilterChange(v as FilterType)}>
          <SelectTrigger className='h-8 w-auto px-3 border-none bg-muted text-xs font-medium rounded-full hover:bg-muted/80 transition-colors'>
            <SelectValue defaultValue={filterType} />
          </SelectTrigger>
          <SelectContent align='start'>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Dropdown */}
        <Select value={sortType} onValueChange={(v) => onSortChange(v as SortType)}>
          <SelectTrigger className='h-8 w-auto px-3 border-none bg-muted text-xs font-medium rounded-full hover:bg-muted/80 transition-colors'>
            <SelectValue defaultValue={sortType} />
          </SelectTrigger>
          <SelectContent align='start'>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Result Count */}
        {totalCount > 0 && (
          <Badge variant='secondary' className='ml-auto text-xs'>
            {totalCount} {text.contactsFilter.resultsLabel}
          </Badge>
        )}
      </div>

      {/* Active Filters Display */}
      {(searchQuery || filterType !== 'all' || sortType !== 'name') && (
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span>{text.contactsFilter.filtersLabel}</span>
          {searchQuery && (
            <Badge
              variant='outline'
              className='gap-1 cursor-pointer hover:bg-destructive/10'
              onClick={() => onSearchChange('')}
            >
              {`"${searchQuery}"`}
              <X className='w-3 h-3' />
            </Badge>
          )}
          {filterType !== 'all' && (
            <Badge
              variant='outline'
              className='gap-1 cursor-pointer hover:bg-destructive/10'
              onClick={() => onFilterChange('all')}
            >
              {activeFilter?.label}
              <X className='w-3 h-3' />
            </Badge>
          )}
          {sortType !== 'name' && (
            <Badge
              variant='outline'
              className='gap-1 cursor-pointer hover:bg-destructive/10'
              onClick={() => onSortChange('name')}
            >
              {text.contactsFilter.sortLabel} {activeSort?.label}
              <X className='w-3 h-3' />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
