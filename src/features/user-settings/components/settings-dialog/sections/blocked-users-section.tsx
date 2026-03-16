import { ArrowLeft, Loader2, Ban, MessageSquare, Phone, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/common/user-avatar'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { useMyBlockedUsers } from '@/features/user/queries/use-queries'
import { useUnblockUserMutation } from '@/features/user/queries/use-mutations'
import { toast } from 'sonner'
import type { BlockedUserDetailResponse } from '@/features/user/schemas/block.schema'

interface BlockedUsersSectionProps {
  onBack?: () => void
}

export function BlockedUsersSection({ onBack }: BlockedUsersSectionProps) {
  const { text } = useUserText()
  const { data: blockedUsers, isLoading } = useMyBlockedUsers()
  const unblockMutation = useUnblockUserMutation()

  const handleUnblock = (user: BlockedUserDetailResponse) => {
    if (window.confirm(text.settings.accountPrivacy.blockedUsers.unblockConfirm(user.fullName))) {
      unblockMutation.mutate(user.blockedUserId, {
        onSuccess: () => {
          toast.success(text.settings.accountPrivacy.blockedUsers.unblockSuccess(user.fullName))
        },
        onError: () => {
          toast.error(text.settings.accountPrivacy.blockedUsers.unblockError)
        }
      })
    }
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center gap-3 mb-4'>
        {onBack && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onBack}
            className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground shrink-0'
          >
            <ArrowLeft className='w-5 h-5' strokeWidth={1.5} />
          </Button>
        )}
        <h2 className='text-[16px] font-semibold text-foreground'>{text.settings.accountPrivacy.blockedUsers.title}</h2>
      </div>

      <div className='flex-1 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-border/50 overflow-hidden flex flex-col'>
        {isLoading ? (
          <div className='p-6 space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='flex items-center gap-3'>
                <Skeleton className='w-10 h-10 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-32' />
                </div>
                <Skeleton className='h-8 w-20' />
              </div>
            ))}
          </div>
        ) : blockedUsers && blockedUsers.length > 0 ? (
          <div className='flex flex-col flex-1'>
            <div className='px-4 py-3 border-b border-border/40'>
              <p className='text-[13px] text-muted-foreground'>
                {text.settings.accountPrivacy.blockedUsers.description}
              </p>
            </div>
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
              {blockedUsers.map((user) => (
                <div key={user.id} className='flex items-center gap-3 group transition-colors'>
                  <UserAvatar
                    src={user.avatar}
                    name={user.fullName}
                    className='w-10 h-10'
                    fallbackClassName='bg-muted text-foreground'
                  />
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-[15px] font-medium text-foreground truncate'>{user.fullName}</h3>
                  </div>
                  <div className='flex items-center gap-2 mr-1'>
                    {user.preference.message && (
                      <span title={text.settings.accountPrivacy.blockedUsers.types.message}>
                        <MessageSquare className='w-3.5 h-3.5 text-muted-foreground/70' />
                      </span>
                    )}
                    {user.preference.call && (
                      <span title={text.settings.accountPrivacy.blockedUsers.types.call}>
                        <Phone className='w-3.5 h-3.5 text-muted-foreground/70' />
                      </span>
                    )}
                    {user.preference.story && (
                      <span title={text.settings.accountPrivacy.blockedUsers.types.story}>
                        <Camera className='w-3.5 h-3.5 text-muted-foreground/70' />
                      </span>
                    )}
                  </div>
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={() => handleUnblock(user)}
                    disabled={unblockMutation.isPending}
                    className='bg-[#eaedf0] hover:bg-[#dfe3e8] text-foreground font-medium h-8 px-3 rounded-md'
                  >
                    {unblockMutation.isPending ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                      text.settings.accountPrivacy.blockedUsers.unblockButton
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='flex-1 flex flex-col items-center justify-center p-12 text-center'>
            <div className='relative mb-4'>
              <div className='w-20 h-20 bg-blue-50 dark:bg-blue-950/20 rounded-full flex items-center justify-center'>
                <UserAvatar name='' className='w-14 h-14 opacity-40' />
              </div>
              <div className='absolute bottom-0 right-0 bg-white dark:bg-zinc-900 rounded-full p-1 border-2 border-white dark:border-zinc-900'>
                <Ban className='w-6 h-6 text-destructive ring-2 ring-white dark:ring-zinc-900 rounded-full bg-white dark:bg-zinc-900' />
              </div>
            </div>
            <p className='text-[15px] font-medium text-muted-foreground'>
              {text.settings.accountPrivacy.blockedUsers.empty}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
