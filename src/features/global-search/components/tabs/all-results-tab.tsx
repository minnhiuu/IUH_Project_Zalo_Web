import { useNavigate } from 'react-router'
import { 
  useGlobalSearchContacts, 
  useInfiniteGlobalSearchMessages, 
  useInfiniteGlobalSearchFiles 
} from '../../queries/use-queries'
import { MessageResultSkeleton, MessageResultCard } from '@/components/common/search/message-result-card'
import { EmptyState } from '@/components/common/search/empty-state'
import { ResultSection } from '../result-section'
import { ContactItem } from '../contact-item'
import { useGlobalSearchText } from '../../i18n/use-global-search-text'
import type { ConversationSearchResponse } from '@/features/search/messages/schemas/message-search.schema'

interface AllResultsTabProps {
  keyword: string
  onViewAllContacts: () => void
  onViewAllMessages: () => void
  onViewAllFiles: () => void
  onClose: () => void
  text: ReturnType<typeof useGlobalSearchText>['text']
  sectionSize: number
}

export function AllResultsTab({
  keyword,
  onViewAllContacts,
  onViewAllMessages,
  onViewAllFiles,
  onClose,
  text,
  sectionSize
}: AllResultsTabProps) {
  const navigate = useNavigate()
  
  // Independent queries for each section
  const { data: contactsData, isLoading: isLoadingContacts } = useGlobalSearchContacts(keyword, 0, sectionSize)
  const { data: messagesData, isLoading: isLoadingMessages } = useInfiniteGlobalSearchMessages({ keyword }, sectionSize)
  const { data: filesData, isLoading: isLoadingFiles } = useInfiniteGlobalSearchFiles({ keyword }, sectionSize)

  const isLoadingInitial = isLoadingContacts && isLoadingMessages && isLoadingFiles
  
  const hasResults = 
    (contactsData?.totalItems || 0) > 0 || 
    (messagesData?.pages?.[0]?.totalItems || 0) > 0 || 
    (filesData?.pages?.[0]?.totalItems || 0) > 0

  const allFinished = !isLoadingContacts && !isLoadingMessages && !isLoadingFiles

  if (isLoadingInitial) {
    return (
      <div className='flex flex-col'>
        {Array.from({ length: 6 }).map((_, i) => (
          <MessageResultSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (allFinished && !hasResults) {
    return (
      <div className='p-8'>
        <EmptyState image='/images/search_empty_state.png' text={text.states.empty} />
      </div>
    )
  }

  return (
    <>
      {/* Contacts Section */}
      {(isLoadingContacts || (contactsData?.totalItems || 0) > 0) && (
        <ResultSection
          title={text.sections.contacts}
          onViewAll={onViewAllContacts}
          count={contactsData?.totalItems || 0}
          displayedCount={contactsData?.data?.length || 0}
          text={text}
          isLoading={isLoadingContacts}
        >
          <div className='flex flex-col'>
            {isLoadingContacts ? (
              Array.from({ length: 2 }).map((_, i) => <MessageResultSkeleton key={i} />)
            ) : (
              contactsData?.data?.map((contact: ConversationSearchResponse) => (
                <ContactItem
                  key={contact.conversationId}
                  name={contact.name}
                  displayHighlights={contact.displayHighlights}
                  avatar={contact.avatar || undefined}
                  onClick={() => {
                    navigate(`/chat/c/${contact.conversationId}`)
                    onClose()
                  }}
                />
              ))
            )}
          </div>
        </ResultSection>
      )}

      {/* Messages Section */}
      {(isLoadingMessages || (messagesData?.pages[0]?.totalItems || 0) > 0) && (
        <ResultSection
          title={text.sections.messages}
          onViewAll={onViewAllMessages}
          count={messagesData?.pages[0]?.totalItems || 0}
          displayedCount={messagesData?.pages[0]?.data?.length || 0}
          text={text}
          isLoading={isLoadingMessages}
        >
          <div className='flex flex-col'>
            {isLoadingMessages ? (
              Array.from({ length: 2 }).map((_, i) => <MessageResultSkeleton key={i} />)
            ) : (
              messagesData?.pages[0]?.data?.map((msg) => (
                <MessageResultCard
                  key={msg.messageId}
                  msg={msg}
                  onClick={() => {
                    navigate(`/chat/c/${msg.conversationId}?msgId=${msg.messageId}`)
                    onClose()
                  }}
                />
              ))
            )}
          </div>
        </ResultSection>
      )}

      {/* Files Section */}
      {(isLoadingFiles || (filesData?.pages[0]?.totalItems || 0) > 0) && (
        <ResultSection
          title={text.sections.files}
          onViewAll={onViewAllFiles}
          count={filesData?.pages[0]?.totalItems || 0}
          displayedCount={filesData?.pages[0]?.data?.length || 0}
          text={text}
          isLoading={isLoadingFiles}
        >
          <div className='flex flex-col'>
            {isLoadingFiles ? (
              Array.from({ length: 2 }).map((_, i) => <MessageResultSkeleton key={i} />)
            ) : (
              filesData?.pages[0]?.data?.map((file) => (
                <MessageResultCard
                  key={file.messageId}
                  variant='file'
                  msg={file}
                  onClick={() => {
                    navigate(`/chat/c/${file.conversationId}?msgId=${file.messageId}`)
                    onClose()
                  }}
                />
              ))
            )}
          </div>
        </ResultSection>
      )}
    </>
  )
}
