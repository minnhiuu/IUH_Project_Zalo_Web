import { Search, X, Filter, ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFriendText } from '../i18n/use-friend-text'

export type FilterType = 'all' | 'friends' | 'requests' | 'blocked'
export type SortType = 'name_asc' | 'name_desc' | 'recent' | 'online'

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
  onSortChange
}: ContactsFilterProps) {
  const { text } = useFriendText()

  const filterOptions: Array<{ value: FilterType; label: string }> = [
    { value: 'all', label: text.contactsFilter.filterOptions.all },
    { value: 'friends', label: text.contactsFilter.filterOptions.friends },
    { value: 'requests', label: text.contactsFilter.filterOptions.requests },
    { value: 'blocked', label: text.contactsFilter.filterOptions.blocked }
  ]

  const sortOptions: Array<{ value: SortType; label: string }> = [
    { value: 'name_asc', label: text.contactsFilter.sortOptions.nameAZ },
    { value: 'name_desc', label: text.contactsFilter.sortOptions.nameZA },
    { value: 'recent', label: text.contactsFilter.sortOptions.recent },
    { value: 'online', label: text.contactsFilter.sortOptions.online }
  ]

  return (
    <div className='bg-background px-4 py-3 flex items-center gap-2'>
      {/* Search Input - Compact Zalo Style */}
      <div className='relative group flex-1'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/60 group-focus-within:text-primary transition-colors' />
        <Input
          type='text'
          placeholder={text.contactsFilter.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className='pl-9 pr-8 h-[36px] w-full bg-(--input-field-bg-outline) border-border-(--input-field-bg-filled) rounded-[6px] text-sm placeholder:text-text-secondary/60 focus-visible:ring-1 focus-visible:ring-primary/20 transition-all'
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>

      {/* Chips Area - Sort and Filter on the same row */}
      <div className='flex items-center gap-2 shrink-0'>
        {/* Sort Chip */}
        <Select value={sortType} onValueChange={(v) => onSortChange(v as SortType)}>
          <SelectTrigger className='h-[36px] min-w-[160px] px-3 border border-border-(--input-field-bg-filled) bg-(--input-field-bg-outline) text-sm font-normal rounded-[6px] text-(--button-secondary-neutral-text) hover:bg-muted/30 transition-colors gap-2 shadow-none focus:ring-0'>
            <ArrowUpDown className='w-4 h-4 shrink-0 opacity-70' />
            <div className='truncate flex-1 text-left'>
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent align='end'>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className='text-sm'>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter Chip */}
        <Select value={filterType} onValueChange={(v) => onFilterChange(v as FilterType)}>
          <SelectTrigger className='h-[36px] px-3 border border-border-(--input-field-bg-filled) bg-(--input-field-bg-outline) text-sm font-normal rounded-[6px] text-(--button-secondary-neutral-text) hover:bg-muted/30 transition-colors gap-2 shadow-none focus:ring-0'>
            <Filter className='w-4 h-4 shrink-0 opacity-70' />
            <div className='truncate max-w-[100px]'>
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent align='end'>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className='text-sm'>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
