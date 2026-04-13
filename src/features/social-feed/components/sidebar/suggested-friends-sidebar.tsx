import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSocialText } from '../../i18n/use-social-text'

const SUGGESTED_FRIENDS = [
  { id: 1, name: 'Hoàng Huy', mutual: 12, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Huy' },
  { id: 2, name: 'Minh Tuấn', mutual: 5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tuan' },
  { id: 3, name: 'Thanh Hà', mutual: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ha' }
]

export function SuggestedFriendsSidebar() {
  const { text } = useSocialText()

  return (
    <aside className='hidden w-70 shrink-0 lg:block'>
      <div className='sticky top-0 space-y-6 pb-10'>
        <Card className='shadow-sm border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950/50 dark:backdrop-blur-xl'>
          <CardHeader className='pb-4 pt-6 px-6'>
            <CardTitle className='text-[15px] font-bold text-zinc-900 dark:text-[#ececec] flex items-center justify-between'>
              {text.suggested.title}
              <button className='text-[13px] font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors'>
                {text.suggested.seeAll}
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 px-6 pb-6'>
            {SUGGESTED_FRIENDS.map((friend) => (
              <div key={friend.id} className='flex items-center justify-between group'>
                <div className='flex items-center gap-3 cursor-pointer'>
                  <UserAvatar
                    name={friend.name}
                    src={friend.avatar}
                    className='h-10 w-10 border border-zinc-200 dark:border-white/5 transition-transform group-hover:scale-105'
                  />
                  <div>
                    <p className='text-[14.5px] font-semibold text-zinc-800 dark:text-[#ececec] group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors'>
                      {friend.name}
                    </p>
                    <p className='text-[12.5px] font-medium text-zinc-500 dark:text-zinc-500'>
                      {text.suggested.mutualCount(friend.mutual)}
                    </p>
                  </div>
                </div>
                <Button
                  variant='secondary'
                  size='xs'
                  className='h-8 px-4 rounded-lg text-[13px] font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-300 transition-colors'
                >
                  {text.suggested.addFriend}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className='text-[12.5px] font-medium text-zinc-500 dark:text-zinc-500 px-2 flex flex-wrap gap-x-4 gap-y-2 justify-center text-center'>
          <a href='#' className='hover:text-zinc-900 dark:hover:text-[#ececec] transition-colors'>
            {text.suggested.footerPrivacy}
          </a>
          <a href='#' className='hover:text-zinc-900 dark:hover:text-[#ececec] transition-colors'>
            {text.suggested.footerTerms}
          </a>
          <a href='#' className='hover:text-zinc-900 dark:hover:text-[#ececec] transition-colors'>
            {text.suggested.footerAds}
          </a>
          <a href='#' className='hover:text-zinc-900 dark:hover:text-[#ececec] transition-colors'>
            {text.suggested.footerCookie}
          </a>
          <span className='w-full pt-1'>{text.suggested.footerBrand(new Date().getFullYear())}</span>
        </div>
      </div>
    </aside>
  )
}
