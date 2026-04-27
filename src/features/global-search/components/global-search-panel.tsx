import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/user-avatar'
import { useDebounce } from '@/hooks/use-debounce'
import { MessageResultCard, MessageResultSkeleton } from '@/components/common/search/message-result-card'
import { EmptyState } from '@/components/common/search/empty-state'
import { useGlobalSearchOverview } from '../queries/use-queries'
import { useNavigate } from 'react-router'
import { useGlobalSearchText } from '../i18n/use-global-search-text'

const TEST_SECTION_SIZE = 1 // Change this to test pagination (e.g., 1 or 5)

interface GlobalSearchPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type TabType = 'all' | 'contacts' | 'messages' | 'files'

export function GlobalSearchPanel({ open, onOpenChange }: GlobalSearchPanelProps) {
  const navigate = useNavigate()
  const { text } = useGlobalSearchText()
  const [searchValue, setSearchValue] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('all')

  const debouncedKeyword = useDebounce(searchValue, 500)

  const { data: overviewData, isLoading } = useGlobalSearchOverview(
    { keyword: debouncedKeyword },
    TEST_SECTION_SIZE,
    open && activeTab === 'all'
  )

  const handleClose = () => {
    onOpenChange(false)
    setSearchValue('')
    setActiveTab('all')
  }

  const handleSelectConversation = (conversationId: string) => {
    navigate(`/chat/c/${conversationId}`)
    handleClose()
  }

  const handleNavigateToMessage = (messageId: string, conversationId: string) => {
    navigate(`/chat/c/${conversationId}?msgId=${messageId}`)
    handleClose()
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: text.tabs.all },
    { id: 'contacts', label: text.tabs.contacts },
    { id: 'messages', label: text.tabs.messages },
    { id: 'files', label: text.tabs.files }
  ]

  const hasResults =
    overviewData &&
    (overviewData.contacts.totalItems > 0 || overviewData.messages.totalItems > 0 || overviewData.files.totalItems > 0)

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
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={text.placeholder}
            className='h-8 pl-10 pr-8 bg-muted/60 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-text-secondary/60 text-sm'
            autoFocus
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
        ) : isLoading ? (
          <div className='flex flex-col'>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i}>
                <MessageResultSkeleton />
              </span>
            ))}
          </div>
        ) : !hasResults && activeTab === 'all' ? (
          <div className='p-8'>
            <EmptyState image='/images/search_empty_state.png' text={text.states.empty} />
          </div>
        ) : (
          <div className='flex flex-col pb-4'>
            {activeTab === 'all' && overviewData && (
              <>
                {overviewData.contacts.totalItems > 0 && (
                  <ResultSection
                    title={text.sections.contacts}
                    onViewAll={() => setActiveTab('contacts')}
                    count={overviewData.contacts.totalItems}
                    displayedCount={overviewData.contacts.data.length}
                    text={text}
                  >
                    <div className='flex flex-col'>
                      {overviewData.contacts.data.map((contact) => (
                        <ContactItem
                          key={contact.conversationId}
                          name={contact.name}
                          displayHighlights={contact.displayHighlights}
                          avatar={contact.avatar || undefined}
                          onClick={() => handleSelectConversation(contact.conversationId)}
                        />
                      ))}
                    </div>
                  </ResultSection>
                )}

                {overviewData.messages.totalItems > 0 && (
                  <ResultSection
                    title={text.sections.messages}
                    onViewAll={() => setActiveTab('messages')}
                    count={overviewData.messages.totalItems}
                    displayedCount={overviewData.messages.data.length}
                    text={text}
                  >
                    <div className='flex flex-col'>
                      {overviewData.messages.data.map((msg) => (
                        <MessageResultCard
                          key={msg.messageId}
                          msg={msg}
                          onClick={() => handleNavigateToMessage(msg.messageId, msg.conversationId)}
                        />
                      ))}
                    </div>
                  </ResultSection>
                )}

                {overviewData.files.totalItems > 0 && (
                  <ResultSection
                    title={text.sections.files}
                    onViewAll={() => setActiveTab('files')}
                    count={overviewData.files.totalItems}
                    displayedCount={overviewData.files.data.length}
                    text={text}
                  >
                    <div className='flex flex-col'>
                      {overviewData.files.data.map((file) => (
                        <MessageResultCard
                          key={file.messageId}
                          variant='file'
                          msg={file}
                          onClick={() => handleNavigateToMessage(file.messageId, file.conversationId)}
                        />
                      ))}
                    </div>
                  </ResultSection>
                )}
              </>
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== 'all' && (
              <div className='p-8 text-center text-text-secondary'>{text.states.developing(activeTab)}</div>
            )}
          </div>
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

function ResultSection({
  title,
  children,
  onViewAll,
  count,
  displayedCount,
  text
}: {
  title: string
  children: React.ReactNode
  onViewAll?: () => void
  count?: number
  displayedCount?: number
  text: ReturnType<typeof useGlobalSearchText>['text']
}) {
  return (
    <section className='flex flex-col mt-4'>
      <div className='px-4 py-2 flex items-center justify-between'>
        <h3 className='text-[15px] font-bold text-text-primary'>
          {title} {count !== undefined && count > 0 && `(${count})`}
        </h3>
      </div>
      <div className='flex flex-col'>{children}</div>
      {count !== undefined && displayedCount !== undefined && count > displayedCount && (
        <div className='px-4 mt-2'>
          <Button variant='secondary' onClick={onViewAll} className='w-full font-semibold'>
            {title === text.sections.messages
              ? text.actions.viewAllMessages
              : title === text.sections.files
                ? text.actions.viewAllFiles
                : title === text.sections.contacts
                  ? text.actions.viewAllContacts
                  : text.actions.viewAll}
          </Button>
        </div>
      )}
      <div className='mx-4 mt-4 border-t border-border/50' />
    </section>
  )
}

function ContactItem({
  name,
  displayHighlights,
  avatar,
  onClick
}: {
  name: string
  displayHighlights: string | null
  avatar?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className='flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 cursor-pointer transition-colors group'
    >
      <UserAvatar name={name} src={avatar} className='w-12 h-12 shrink-0' />
      <div className='flex flex-col min-w-0'>
        {displayHighlights ? (
          <span
            className='text-[15px] font-medium text-text-primary truncate [&_em]:text-(--text-mention) [&_em]:not-italic [&_em]:font-semibold'
            dangerouslySetInnerHTML={{ __html: displayHighlights }}
          />
        ) : (
          <span className='text-[15px] font-medium text-text-primary truncate'>{name}</span>
        )}
      </div>
    </div>
  )
}
