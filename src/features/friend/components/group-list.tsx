import { SearchEmpty } from '@/components/common/search-empty'
import { useFriendText } from '../i18n/use-friend-text'

export function GroupList() {
  const { text } = useFriendText()

  return (
    <div className='flex-1 flex flex-col h-full overflow-hidden bg-[#f0f2f5] dark:bg-background'>
      {/* Header */}
      <div className='bg-background border-b border-border px-4 py-3 shrink-0'>
        <h1 className='text-[17px] font-semibold text-foreground'>{text.sidebar.groupList}</h1>
      </div>

      {/* Content */}
      <div className='flex-1 flex items-center justify-center bg-background'>
        <SearchEmpty title={text.comingSoon.title} description={text.comingSoon.description} />
      </div>
    </div>
  )
}
