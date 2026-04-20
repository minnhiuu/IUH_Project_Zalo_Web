import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import type { UserResponse } from '@/features/user/schemas/user.schema'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { CircleOff } from 'lucide-react'

interface DeactivatedProfileStateProps {
  user: UserResponse
  isOwner?: boolean
  onGoToSettings?: () => void
}

export function DeactivatedProfileState({ user, isOwner = false, onGoToSettings }: DeactivatedProfileStateProps) {
  const { text } = useUserText()

  return (
    <div className='flex h-full flex-col bg-background'>
      <div className='relative h-44 w-full overflow-hidden bg-linear-to-br from-zinc-200 via-zinc-100 to-zinc-300 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.55),transparent_42%),radial-gradient(circle_at_85%_0%,rgba(255,255,255,0.35),transparent_34%)] dark:bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.08),transparent_42%),radial-gradient(circle_at_80%_5%,rgba(255,255,255,0.06),transparent_34%)]' />
      </div>

      <div className='-mt-11 px-5 pb-6'>
        <div className='rounded-2xl border border-border/70 bg-card/95 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm'>
          <div className='mx-auto mb-4 rounded-full border-4 border-background bg-background shadow-[0_4px_16px_rgba(0,0,0,0.12)] w-22 h-22 overflow-hidden'>
            <UserAvatar
              src={user.avatar}
              name={user.fullName}
              className='w-full h-full'
              fallbackClassName='text-2xl font-bold'
            />
          </div>

          <div className='space-y-3 text-center'>
            <h3 className='text-[17px] font-bold text-foreground'>{user.fullName}</h3>

            <div className='inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-700 dark:text-amber-300'>
              <CircleOff className='h-4 w-4' />
              {text.profile.deactivatedTitle}
            </div>

            <p className='mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground'>
              {isOwner ? text.profile.deactivatedOwnerDescription : text.profile.deactivatedDescription}
            </p>

            {isOwner && onGoToSettings && (
              <Button type='button' variant='secondary-blue' className='mt-2 w-full sm:w-auto' onClick={onGoToSettings}>
                {text.profile.goToSettings}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
