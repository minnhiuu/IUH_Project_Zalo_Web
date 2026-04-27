import { Fragment } from 'react'
import { useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { useInfiniteGlobalSearchContactsCategorized } from '../../queries/use-queries'
import { EmptyState } from '@/components/common/search/empty-state'
import { ResultSection } from '../result-section'
import { ContactItem } from '../contact-item'
import { useGlobalSearchText } from '../../i18n/use-global-search-text'
import type {
  ContactSearchTabResponse,
  ConversationSearchResponse
} from '@/features/search/messages/schemas/message-search.schema'

interface ContactsTabProps {
  keyword: string
  onClose: () => void
  text: ReturnType<typeof useGlobalSearchText>['text']
  sectionSize: number
}

export function ContactsTab({ keyword, onClose, text, sectionSize }: ContactsTabProps) {
  const navigate = useNavigate()
  const {
    data: contactsData,
    fetchNextPage,
    isLoading
  } = useInfiniteGlobalSearchContactsCategorized(keyword, sectionSize)

  if (isLoading) {
    return (
      <div className='p-8 flex justify-center'>
        <Loader2 className='w-6 h-6 animate-spin text-primary' />
      </div>
    )
  }

  const firstPage = contactsData?.pages[0]
  if (!firstPage || (firstPage.people.totalItems === 0 && firstPage.groups.totalItems === 0)) {
    return <EmptyState text={text.states.empty} />
  }

  return (
    <div className='flex flex-col py-2'>
      {firstPage.people.totalItems > 0 && (
        <ResultSection
          title={text.sections.people}
          count={firstPage.people.totalItems}
          displayedCount={contactsData?.pages.reduce((acc, page) => acc + (page.people?.data?.length || 0), 0)}
          onViewAll={fetchNextPage}
          text={text}
        >
          <div className='flex flex-col'>
            {contactsData?.pages.map((page: ContactSearchTabResponse, i: number) => (
              <Fragment key={i}>
                {page.people.data.map((contact: ConversationSearchResponse) => (
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
              </Fragment>
            ))}
          </div>
        </ResultSection>
      )}

      {firstPage.groups.totalItems > 0 && (
        <ResultSection
          title={text.sections.groups}
          count={firstPage.groups.totalItems}
          displayedCount={contactsData?.pages.reduce((acc, page) => acc + (page.groups?.data?.length || 0), 0)}
          onViewAll={fetchNextPage}
          text={text}
        >
          <div className='flex flex-col'>
            {contactsData?.pages.map((page: ContactSearchTabResponse, i: number) => (
              <Fragment key={i}>
                {page.groups.data.map((group: ConversationSearchResponse) => (
                  <ContactItem
                    key={group.conversationId}
                    name={group.name}
                    displayHighlights={group.displayHighlights}
                    avatar={group.avatar || undefined}
                    onClick={() => {
                      navigate(`/chat/c/${group.conversationId}`)
                      onClose()
                    }}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </ResultSection>
      )}
    </div>
  )
}
