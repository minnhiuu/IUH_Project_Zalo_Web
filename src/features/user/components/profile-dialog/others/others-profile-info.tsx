import { Users, Ban, MessageSquareWarning, IdCard } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { type UserResponse } from '@/features/user/schemas/user.schema'
import { useUserText } from '../../../i18n/use-user-text'
import { ProfileInfoBase } from '../shared/profile-info-base'
import { cn } from '@/lib/utils'

interface OthersProfileInfoProps {
  user: UserResponse
}

export function OthersProfileInfo({ user }: OthersProfileInfoProps) {
  const { text } = useUserText()

  return (
    <ProfileInfoBase
      user={user}
      cover={
        <div className='w-full h-full bg-muted overflow-hidden relative'>
          {user.background ? (
            <img
              src={user.background}
              alt='cover'
              className='h-full w-full object-cover'
              style={{
                objectPosition: `center ${user.backgroundY || 50}%`
              }}
            />
          ) : (
            <div className='h-full w-full bg-linear-to-r from-brand-blue-dark to-brand-blue opacity-90' />
          )}
        </div>
      }
      avatar={
        <div className='rounded-full border-4 border-background bg-background shadow-[0_4px_16px_rgba(0,0,0,0.12)] w-20 h-20 overflow-hidden relative'>
          <UserAvatar
            src={user.avatar}
            name={user.fullName}
            className='w-full h-full'
            fallbackClassName='text-2xl font-bold'
          />
        </div>
      }
      contentBeforeInfo={
        <div className='flex gap-3 w-full mb-4 mt-2'>
          <Button
            variant='secondary-blue'
            className='flex-1 font-bold h-9 rounded-md border-none shadow-none transition-all active:scale-95'
          >
            {text.profile.message}
          </Button>
        </div>
      }
      footer={
        <>
          <Separator className='h-1.5 bg-section-divider border-none shrink-0' />
          <div className='flex flex-col py-2 bg-background'>
            {[
              { icon: Users, label: text.profile.mutualGroups(0), color: 'text-disabled', disabled: true },
              { icon: IdCard, label: text.profile.shareContact, color: 'text-disabled', disabled: true },
              { icon: Ban, label: text.profile.block, color: 'text-icon-secondary', disabled: false },
              { icon: MessageSquareWarning, label: text.profile.report, color: 'text-icon-secondary', disabled: false }
            ].map((item, idx, arr) => (
              <div key={item.label}>
                {item.disabled ? (
                  <div className='flex w-full items-center gap-3 px-4 py-3.5 text-[15px]'>
                    <item.icon className={cn('h-5 w-5', item.color)} strokeWidth={1.5} />
                    <span className={cn('font-medium', item.color)}>{item.label}</span>
                  </div>
                ) : (
                  <button className='flex w-full items-center gap-3 px-4 py-3.5 text-[15px] hover:bg-muted transition-colors text-foreground group cursor-pointer'>
                    <item.icon
                      className={cn('h-5 w-5 group-hover:opacity-80 transition-opacity', item.color)}
                      strokeWidth={1.5}
                    />
                    <span className='font-medium'>{item.label}</span>
                  </button>
                )}
                {idx < arr.length - 1 && <Separator className='ml-12 mr-4 bg-border/40' />}
              </div>
            ))}
          </div>
        </>
      }
    />
  )
}
