import { Fragment } from 'react'
import { useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { useInfiniteGlobalSearchPeople, useInfiniteGlobalSearchGroups } from '../../queries/use-queries'
import { EmptyState } from '@/features/search'
import { ResultSection } from '../result-section'
import { ContactItem } from '../contact-item'
import type { SearchTexts } from '../../../i18n/search.texts'
import { useAddSearchItem } from '../../../recent/queries/use-recent-queries'
import { SearchType } from '@/constants/enum'
import { generateKeywordId } from '../../../utils/search-id'

interface ContactsTabProps {
  keyword: string
  text: SearchTexts['globalSearch']
}

export function ContactsTab({ keyword, text }: ContactsTabProps) {
  const navigate = useNavigate()
  const { mutate: addSearchItem } = useAddSearchItem()

  const {
    data: peopleData,
    fetchNextPage: fetchNextPeople,
    hasNextPage: hasNextPeople,
    isLoading: isLoadingPeople
  } = useInfiniteGlobalSearchPeople(keyword, 20)

  const {
    data: groupsData,
    fetchNextPage: fetchNextGroups,
    hasNextPage: hasNextGroups,
    isLoading: isLoadingGroups
  } = useInfiniteGlobalSearchGroups(keyword, 20)

  const isLoading = isLoadingPeople && isLoadingGroups

  if (isLoading) {
    return (
      <div className='p-8 flex justify-center'>
        <Loader2 className='w-6 h-6 animate-spin text-primary' />
      </div>
    )
  }

  const peopleCount = peopleData?.pages[0]?.totalItems || 0
  const groupsCount = groupsData?.pages[0]?.totalItems || 0

  if (peopleCount === 0 && groupsCount === 0 && !isLoadingPeople && !isLoadingGroups) {
    return <EmptyState text={text.states.empty} />
  }

  return (
    <div className='flex flex-col py-2'>
      {peopleCount > 0 && (
        <ResultSection
          title={text.sections.people}
          count={peopleCount}
          displayedCount={peopleData?.pages?.reduce((acc, page) => acc + (page?.data?.length || 0), 0) || 0}
          onViewAll={hasNextPeople ? fetchNextPeople : undefined}
          text={text}
        >
          <div className='flex flex-col'>
            {peopleData?.pages?.map((page, i) => (
              <Fragment key={i}>
                {page?.data?.map((contact) => (
                  <ContactItem
                    key={contact.conversationId}
                    name={contact.name}
                    displayHighlights={contact.displayHighlights}
                    avatar={contact.avatar || undefined}
                    isGroup={contact.group}
                    participantNames={contact.participantNames}
                    participantAvatars={contact.participantAvatars}
                    onClick={() => {
                      if (keyword.trim()) {
                        addSearchItem({
                          id: generateKeywordId(keyword),
                          name: keyword.trim(),
                          type: SearchType.Keyword
                        })
                      }
                      addSearchItem({
                        id: contact.conversationId,
                        name: contact.name,
                        avatar: contact.avatar || undefined,
                        type: contact.group ? SearchType.Group : SearchType.User
                      })
                      navigate(`/chat/c/${contact.conversationId}`)
                    }}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </ResultSection>
      )}

      {groupsCount > 0 && (
        <ResultSection
          title={text.sections.groups}
          count={groupsCount}
          displayedCount={groupsData?.pages?.reduce((acc, page) => acc + (page?.data?.length || 0), 0) || 0}
          onViewAll={hasNextGroups ? fetchNextGroups : undefined}
          text={text}
        >
          <div className='flex flex-col'>
            {groupsData?.pages?.map((page, i) => (
              <Fragment key={i}>
                {page?.data?.map((group) => (
                  <ContactItem
                    key={group.conversationId}
                    name={group.name}
                    displayHighlights={group.displayHighlights}
                    avatar={group.avatar || undefined}
                    isGroup={group.group}
                    participantNames={group.participantNames}
                    participantAvatars={group.participantAvatars}
                    onClick={() => {
                      if (keyword.trim()) {
                        addSearchItem({
                          id: generateKeywordId(keyword),
                          name: keyword.trim(),
                          type: SearchType.Keyword
                        })
                      }
                      addSearchItem({
                        id: group.conversationId,
                        name: group.name,
                        avatar: group.avatar || undefined,
                        type: SearchType.Group
                      })
                      navigate(`/chat/c/${group.conversationId}`)
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
