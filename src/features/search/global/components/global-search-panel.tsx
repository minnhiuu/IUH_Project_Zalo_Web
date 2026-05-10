import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { useSearchText } from '../../shared/hooks/use-search-text'
import { AllResultsTab } from './tabs/all-results-tab'
import { ContactsTab } from './tabs/contacts-tab'
import { MessagesTab } from './tabs/messages-tab'
import { FilesTab } from './tabs/files-tab'
import { GlobalSearchProvider } from './global-search-context'
import { RecentSearchList } from '../../recent/components/recent-search-list'
import { SearchType } from '@/constants/enum'
import { useAddSearchItem } from '../../recent/queries/use-recent-queries'
import { generateKeywordId } from '../../utils/search-id'

const PREVIEW_SECTION_SIZE = 3

interface GlobalSearchPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type TabType = 'all' | 'contacts' | 'messages' | 'files'

export function GlobalSearchPanel({ open, onOpenChange }: GlobalSearchPanelProps) {
  const { text: searchText } = useSearchText()
  const text = searchText.globalSearch
  const [searchValue, setSearchValue] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedKeyword = useDebounce(searchValue, 500)
  const { mutate: addSearchItem } = useAddSearchItem()

  useEffect(() => {
    if (open) {
      // Small timeout to ensure the element is visible before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleClose = () => {
    onOpenChange(false)
    setSearchValue('')
    setActiveTab('all')
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: text.tabs.all },
    { id: 'contacts', label: text.tabs.contacts },
    { id: 'messages', label: text.tabs.messages },
    { id: 'files', label: text.tabs.files }
  ]

  return (
    <div className={cn('w-full bg-background flex flex-col h-full', !open && 'hidden')}>
      {/* Search Header */}
      <div className='flex items-center gap-2 px-4 py-3 shrink-0'>
        <div className='relative flex-1 group'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary transition-colors group-focus-within:text-primary' />
          <Input
            ref={inputRef}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchValue.trim() !== '') {
                const keyword = searchValue.trim()
                addSearchItem({
                  id: generateKeywordId(keyword),
                  name: keyword,
                  type: SearchType.Keyword
                })
              }
            }}
            placeholder={text.placeholder}
            className='h-8 pl-10 pr-8 bg-muted/60 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-text-secondary/60 text-sm'
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className='absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full text-text-secondary/50 hover:text-text-primary transition-all'
            >
              <X className='w-4 h-4' />
            </button>
          )}
        </div>
        <button
          onClick={handleClose}
          className='text-[15px] font-semibold text-text-primary hover:text-primary transition-colors px-1 h-8 flex items-center'
        >
          {text.close}
        </button>
      </div>

      {/* Tabs Navigation - Only show when searching */}
      {searchValue && (
        <div className='flex border-b border-border px-4 shrink-0'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3 py-2 text-[14px] font-medium border-b-2 transition-all relative',
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className='flex-1 overflow-y-auto custom-scrollbar bg-background'>
        {!searchValue ? (
          <RecentSearchList
            recentTitle={text.sections.recent}
            noRecentText={text.states.noRecent}
            clearAllText={text.actions.clearAll}
            onSelectKeyword={(keyword) => setSearchValue(keyword)}
            onSelectUser={(user) => {
              // Handle user selection if needed, e.g. open profile or chat
              console.log('Selected user:', user)
            }}
          />
        ) : (
          <GlobalSearchProvider keyword={debouncedKeyword} text={searchText}>
            <div className='flex flex-col pb-4'>
              {activeTab === 'all' && (
                <AllResultsTab
                  keyword={debouncedKeyword}
                  onViewAllContacts={() => setActiveTab('contacts')}
                  onViewAllMessages={() => setActiveTab('messages')}
                  onViewAllFiles={() => setActiveTab('files')}
                  text={searchText}
                  sectionSize={PREVIEW_SECTION_SIZE}
                />
              )}

              {activeTab === 'contacts' && <ContactsTab keyword={debouncedKeyword} text={searchText} />}

              {activeTab === 'messages' && <MessagesTab />}

              {activeTab === 'files' && <FilesTab />}
            </div>
          </GlobalSearchProvider>
        )}
      </div>
    </div>
  )
}
