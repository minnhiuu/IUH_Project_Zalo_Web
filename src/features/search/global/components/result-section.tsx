import React from 'react'
import { Button } from '@/components/ui/button'
import type { SearchTexts } from '../../i18n/search.texts'

interface ResultSectionProps {
  title: string
  children: React.ReactNode
  onViewAll?: () => void
  count?: number
  displayedCount?: number
  text: SearchTexts['globalSearch']
  isLoading?: boolean
}


export function ResultSection({
  title,
  children,
  onViewAll,
  count,
  displayedCount,
  text,
  isLoading
}: ResultSectionProps) {
  return (
    <section className='flex flex-col mt-4'>
      <div className='px-4 py-2 flex items-center justify-between'>
        <h3 className='text-[15px] font-bold text-text-primary'>
          {title} {count !== undefined && count > 0 && `(${count})`}
        </h3>
      </div>
      <div className='flex flex-col'>{children}</div>
      {count !== undefined && displayedCount !== undefined && count > displayedCount && !isLoading && (
        <div className='px-4 mt-2'>
          <Button variant='secondary' onClick={onViewAll} className='w-full font-semibold'>
            {title === text.sections.messages
              ? text.actions.viewAllMessages
              : title === text.sections.files
                ? text.actions.viewAllFiles
                : title === text.sections.contacts
                  ? text.actions.viewAllContacts
                  : title === text.sections.people
                    ? text.actions.viewAllPeople
                    : title === text.sections.groups
                      ? text.actions.viewAllGroups
                      : text.actions.viewAll}
          </Button>
        </div>
      )}
      <div className='mx-4 mt-4 border-t border-border/50' />
    </section>
  )
}
