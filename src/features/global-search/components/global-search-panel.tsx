import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { useGlobalSearchText } from '../i18n/use-global-search-text'
import { AllResultsTab } from './tabs/all-results-tab'
import { ContactsTab } from './tabs/contacts-tab'
import { MessagesTab } from './tabs/messages-tab'
import { FilesTab } from './tabs/files-tab'
import { GlobalSearchProvider } from './global-search-context'

const PREVIEW_SECTION_SIZE = 3

interface GlobalSearchPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type TabType = 'all' | 'contacts' | 'messages' | 'files'

export function GlobalSearchPanel({ open, onOpenChange }: GlobalSearchPanelProps) {
  const { text } = useGlobalSearchText()
  const [searchValue, setSearchValue] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedKeyword = useDebounce(searchValue, 500)

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
    <div
      className={cn(
        'fixed inset-y-0 z-50 w-[344px] bg-background border-r border-border flex flex-col shadow-xl',
        !open && 'hidden'
      )}
      style={{ left: '64px' }}
    >
      {/* Search Header */}
      <div className='flex items-center gap-2 px-4 py-3 shrink-0'>
        <div className='relative flex-1 group'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary transition-colors group-focus-within:text-primary' />
          <Input
            ref={inputRef}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={text.placeholder}
            className='h-8 pl-10 pr-8 bg-muted/60 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-text-secondary/60 text-sm'
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className='absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full text-text-secondary'
            >
              <X className='w-3.5 h-3.5' />
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

      {/* Tabs Navigation */}
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

      {/* Main Content Area */}
      <div className='flex-1 overflow-y-auto custom-scrollbar bg-background'>
        {!searchValue ? (
          <RecentSearchSection text={text} />
        ) : (
          <GlobalSearchProvider keyword={debouncedKeyword} text={text} onClose={handleClose}>
            <div className='flex flex-col pb-4'>
              {activeTab === 'all' && (
                <AllResultsTab
                  keyword={debouncedKeyword}
                  onViewAllContacts={() => setActiveTab('contacts')}
                  onViewAllMessages={() => setActiveTab('messages')}
                  onViewAllFiles={() => setActiveTab('files')}
                  onClose={handleClose}
                  text={text}
                  sectionSize={PREVIEW_SECTION_SIZE}
                />
              )}

              {activeTab === 'contacts' && (
                <ContactsTab keyword={debouncedKeyword} onClose={handleClose} text={text} />
              )}

              {activeTab === 'messages' && <MessagesTab />}

              {activeTab === 'files' && <FilesTab />}
            </div>
          </GlobalSearchProvider>
        )}
      </div>
    </div>
  )
}

function RecentSearchSection({ text }: { text: ReturnType<typeof useGlobalSearchText>['text'] }) {
  return (
    <div className='flex flex-col'>
      <div className='px-4 py-3 flex items-center justify-between'>
        <h3 className='text-[15px] font-bold text-text-primary'>{text.sections.recent}</h3>
        <button className='text-[13px] font-semibold text-primary hover:underline'>{text.actions.clearAll}</button>
      </div>
      <div className='flex flex-col px-2'>
        <div className='px-3 py-2 text-sm text-text-secondary italic'>{text.states.noRecent}</div>
      </div>
    </div>
  )
}
