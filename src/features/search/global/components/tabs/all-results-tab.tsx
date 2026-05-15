import { useNavigate } from 'react-router'
import {
  useGlobalSearchContacts,
  useInfiniteGlobalSearchMessages,
  useInfiniteGlobalSearchFiles
} from '../../queries/use-queries'
import { MessageResultSkeleton, MessageResultCard } from '@/features/search'
import { EmptyState } from '@/features/search'
import { ResultSection } from '../result-section'
import { ContactItem } from '../contact-item'
import type { SearchTexts } from '../../../i18n/search.texts'
import type { ConversationSearchResponse } from '@/features/search/messages/schemas/message-search.schema'

import { useGlobalSearchContext } from '../global-search-context'
import { useAddSearchItem } from '../../../recent/queries/use-recent-queries'
import { SearchType } from '@/constants/enum'
import { generateKeywordId } from '../../../utils/search-id'
import { PhoneUtil } from '@/utils/phone'

interface AllResultsTabProps {
  keyword: string
  onViewAllContacts: () => void
  onViewAllMessages: () => void
  onViewAllFiles: () => void
  text: SearchTexts
  sectionSize: number
}

export function AllResultsTab({
  keyword,
  onViewAllContacts,
  onViewAllMessages,
  onViewAllFiles,
  text,
  sectionSize
}: AllResultsTabProps) {
  const navigate = useNavigate()
  const { activeItemId, setActiveItemId } = useGlobalSearchContext()
  const { mutate: addSearchItem } = useAddSearchItem()

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

  const isPhoneSearch = PhoneUtil.isValidVnPhone(keyword)

  if (allFinished && !hasResults) {
    return (
      <div className='p-8'>
        <EmptyState image='/images/search_empty_state.png' text={text.globalSearch.states.empty} />
      </div>
    )
  }

  return (
    <>
      {/* Contacts Section */}
      {(isLoadingContacts || (contactsData?.totalItems || 0) > 0) && (
        <ResultSection
          title={isPhoneSearch ? text.findByPhone : text.globalSearch.sections.contacts}
          onViewAll={onViewAllContacts}
          count={contactsData?.totalItems || 0}
          displayedCount={contactsData?.data?.length || 0}
          text={text.globalSearch}
          isLoading={isLoadingContacts}
        >
          <div className='flex flex-col'>
            {isLoadingContacts
              ? Array.from({ length: 2 }).map((_, i) => <MessageResultSkeleton key={i} />)
              : contactsData?.data?.map((contact: ConversationSearchResponse) => (
                  <ContactItem
                    key={contact.conversationId}
                    name={contact.name}
                    displayHighlights={contact.displayHighlights}
                    avatar={contact.avatar || undefined}
                    isGroup={contact.group}
                    participantNames={contact.participantNames}
                    participantAvatars={contact.participantAvatars}
                    phoneNumber={isPhoneSearch ? contact.phoneNumber : undefined}
                    phoneLabel={text.phoneNumber}
                    onClick={() => {
                      // Save the contact
                      addSearchItem({
                        id: contact.conversationId || contact.recipientId || '',
                        name: contact.name,
                        avatar: contact.avatar || undefined,
                        type: contact.group ? SearchType.Group : SearchType.User
                      })

                      if (contact.conversationId) {
                        navigate(`/chat/c/${contact.conversationId}`)
                      } else if (contact.recipientId) {
                        navigate(`/chat/u/${contact.recipientId}`)
                      }
                    }}
                  />
                ))}
          </div>
        </ResultSection>
      )}

      {/* Messages Section */}
      {(isLoadingMessages || (messagesData?.pages[0]?.totalItems || 0) > 0) && (
        <ResultSection
          title={text.globalSearch.sections.messages}
          onViewAll={onViewAllMessages}
          count={messagesData?.pages[0]?.totalItems || 0}
          displayedCount={messagesData?.pages[0]?.data?.length || 0}
          text={text.globalSearch}
          isLoading={isLoadingMessages}
        >
          <div className='flex flex-col'>
            {isLoadingMessages
              ? Array.from({ length: 2 }).map((_, i) => <MessageResultSkeleton key={i} />)
              : messagesData?.pages[0]?.data?.map((msg) => (
                  <MessageResultCard
                    key={msg.messageId}
                    msg={msg}
                    isActive={activeItemId === msg.messageId}
                    onClick={() => {
                      if (keyword.trim()) {
                        addSearchItem({
                          id: generateKeywordId(keyword),
                          name: keyword.trim(),
                          type: SearchType.Keyword
                        })
                      }
                      setActiveItemId(msg.messageId)
                      navigate(
                        `/chat/c/${msg.conversationId}?msgId=${msg.messageId}&keyword=${encodeURIComponent(
                          keyword
                        )}&showInfo=true`
                      )
                    }}
                  />
                ))}
          </div>
        </ResultSection>
      )}

      {/* Files Section */}
      {(isLoadingFiles || (filesData?.pages[0]?.totalItems || 0) > 0) && (
        <ResultSection
          title={text.globalSearch.sections.files}
          onViewAll={onViewAllFiles}
          count={filesData?.pages[0]?.totalItems || 0}
          displayedCount={filesData?.pages[0]?.data?.length || 0}
          text={text.globalSearch}
          isLoading={isLoadingFiles}
        >
          <div className='flex flex-col'>
            {isLoadingFiles
              ? Array.from({ length: 2 }).map((_, i) => <MessageResultSkeleton key={i} />)
              : filesData?.pages[0]?.data?.map((file) => (
                  <MessageResultCard
                    key={file.messageId}
                    variant='file'
                    msg={file}
                    isActive={activeItemId === file.messageId}
                    onClick={() => {
                      if (keyword.trim()) {
                        addSearchItem({
                          id: `k-${keyword.trim().toLowerCase()}`,
                          name: keyword.trim(),
                          type: SearchType.Keyword
                        })
                      }
                      setActiveItemId(file.messageId)
                      navigate(
                        `/chat/c/${file.conversationId}?msgId=${file.messageId}&keyword=${encodeURIComponent(
                          keyword
                        )}&showInfo=true`
                      )
                    }}
                  />
                ))}
          </div>
        </ResultSection>
      )}
    </>
  )
}
