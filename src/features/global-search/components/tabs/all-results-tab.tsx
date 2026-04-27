import { useNavigate } from 'react-router'
import { useGlobalSearchOverview } from '../../queries/use-queries'
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
  const { data: overviewData, isLoading } = useGlobalSearchOverview({ keyword }, sectionSize)

  if (isLoading) {
    return (
      <div className='flex flex-col'>
        {Array.from({ length: 6 }).map((_, i) => (
          <MessageResultSkeleton key={i} />
        ))}
      </div>
    )
  }

  const hasResults =
    overviewData &&
    (overviewData.contacts.totalItems > 0 || overviewData.messages.totalItems > 0 || overviewData.files.totalItems > 0)

  if (!hasResults) {
    return (
      <div className='p-8'>
        <EmptyState image='/images/search_empty_state.png' text={text.states.empty} />
      </div>
    )
  }

  return (
    <>
      {overviewData.contacts.totalItems > 0 && (
        <ResultSection
          title={text.sections.contacts}
          onViewAll={onViewAllContacts}
          count={overviewData.contacts.totalItems}
          displayedCount={overviewData.contacts.data.length}
          text={text}
        >
          <div className='flex flex-col'>
            {overviewData.contacts.data.map((contact: ConversationSearchResponse) => (
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
            ))}
          </div>
        </ResultSection>
      )}

      {overviewData.messages.totalItems > 0 && (
        <ResultSection
          title={text.sections.messages}
          onViewAll={onViewAllMessages}
          count={overviewData.messages.totalItems}
          displayedCount={overviewData.messages.data.length}
          text={text}
        >
          <div className='flex flex-col'>
            {overviewData.messages.data.map((msg) => (
              <MessageResultCard
                key={msg.messageId}
                msg={msg}
                onClick={() => {
                  navigate(`/chat/c/${msg.conversationId}?msgId=${msg.messageId}`)
                  onClose()
                }}
              />
            ))}
          </div>
        </ResultSection>
      )}

      {overviewData.files.totalItems > 0 && (
        <ResultSection
          title={text.sections.files}
          onViewAll={onViewAllFiles}
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
                onClick={() => {
                  navigate(`/chat/c/${file.conversationId}?msgId=${file.messageId}`)
                  onClose()
                }}
              />
            ))}
          </div>
        </ResultSection>
      )}
    </>
  )
}
