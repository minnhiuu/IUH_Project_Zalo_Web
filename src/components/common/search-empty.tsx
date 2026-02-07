import { memo } from 'react'

interface SearchEmptyProps {
  title: string
  description?: string
}

export const SearchEmpty = memo(({ title, description }: SearchEmptyProps) => {
  return (
    <div className='flex flex-col items-center justify-center pt-10 px-4 text-center'>
      <div className='relative mb-4'>
        <img src='/images/search-empty.png' alt='No results' className='w-40 h-40 object-contain' />
      </div>
      <p className='text-[15px] font-medium text-foreground mb-1'>{title}</p>
      {description && <p className='text-sm text-muted-foreground'>{description}</p>}
    </div>
  )
})

SearchEmpty.displayName = 'SearchEmpty'
