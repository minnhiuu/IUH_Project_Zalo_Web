import { SearchEmpty } from '@/components/common/search-empty'
import { useFriendText } from '../i18n/use-friend-text'
import { Users } from 'lucide-react'
import { ContactPageLayout } from './contact-page-layout'

export function GroupInviteList() {
  const { text } = useFriendText()

  return (
    <ContactPageLayout
      title={text.sidebar.groupInvites}
      icon={Users}
    >
      <div className='flex-1 flex items-center justify-center bg-background'>
        <SearchEmpty title={text.comingSoon.title} description={text.comingSoon.description} />
      </div>
    </ContactPageLayout>
  )
}
