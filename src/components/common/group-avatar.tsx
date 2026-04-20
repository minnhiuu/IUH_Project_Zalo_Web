import { UserAvatar } from '@/components/common/user-avatar'
import { cn } from '@/lib/utils'

interface GroupAvatarProps {
  avatars: (string | null | undefined)[]
  names: string[]
  count: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function GroupAvatar({ avatars, names, count, size = 'md', className }: GroupAvatarProps) {
  const avatarClassName = 'w-full h-full border border-background'

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const innerSizeClasses = {
    xs: 'w-3 h-3 text-[6px]',
    sm: 'w-4 h-4 text-[8.5px]',
    md: 'w-4.5 h-4.5 text-[8px]',
    lg: 'w-[23px] h-[23px] text-[10px]',
    xl: 'w-7 h-7 text-[12px]'
  }

  const renderAvatars = () => {
    // ────────── 1 Member ──────────
    if (count <= 1) {
      return (
        <div className='relative w-full h-full'>
          <div className='absolute top-0 right-0 w-[60%] h-[60%] rounded-full bg-slate-200 text-slate-500 border border-background shadow-sm flex items-center justify-center'>
            <span className='font-semibold leading-none text-[10px]'>1</span>
          </div>
          <div className='absolute bottom-0 left-0 w-[60%] h-[60%]'>
            <UserAvatar src={avatars[0]} name={names[0] || '?'} className={avatarClassName} />
          </div>
        </div>
      )
    }

    // ────────── 2 Members ──────────
    if (count === 2) {
      return (
        <div className='relative w-full h-full'>
          <div className='absolute top-0 right-0 w-[60%] h-[60%]'>
            <UserAvatar src={avatars[0]} name={names[0] || '?'} className={avatarClassName} />
          </div>
          <div className='absolute bottom-0 left-0 w-[60%] h-[60%]'>
            <UserAvatar src={avatars[1]} name={names[1] || '?'} className={avatarClassName} />
          </div>
        </div>
      )
    }

    // ────────── 3 Members ──────────
    if (count === 3) {
      return (
        <div className='relative w-full h-full'>
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[55%] h-[55%]'>
            <UserAvatar src={avatars[0]} name={names[0] || '?'} className={avatarClassName} />
          </div>
          <div className='absolute bottom-0 left-0 w-[55%] h-[55%]'>
            <UserAvatar src={avatars[1]} name={names[1] || '?'} className={avatarClassName} />
          </div>
          <div className='absolute bottom-0 right-0 w-[55%] h-[55%]'>
            <UserAvatar src={avatars[2]} name={names[2] || '?'} className={avatarClassName} />
          </div>
        </div>
      )
    }

    // ────────── 4+ Members (Grid) ──────────
    const displayAvatars = avatars.slice(0, 3)
    return (
      <div className={cn('grid grid-cols-2 grid-rows-2 w-full h-full p-0 gap-0', size !== 'sm' && 'p-0.5 gap-0.5')}>
        {displayAvatars.map((url, i) => (
          <div
            key={i}
            className={cn('w-full h-full overflow-hidden flex items-center justify-center', innerSizeClasses[size])}
          >
            <UserAvatar src={url} name={names[i] || '?'} className={avatarClassName} />
          </div>
        ))}

        <div className='w-full h-full overflow-hidden flex items-center justify-center'>
          {count > 4 ? (
            <div
              className={cn(
                'w-full h-full rounded-full bg-slate-500/20 dark:bg-slate-500/40 flex items-center justify-center border border-background',
                innerSizeClasses[size]
              )}
            >
              <span
                className={cn(
                  'font-bold text-muted-foreground',
                  size === 'sm'
                    ? 'text-[8px]'
                    : size === 'md'
                      ? 'text-[9px]'
                      : size === 'lg'
                        ? 'text-[11px]'
                        : 'text-[13px]'
                )}
              >
                {count}
              </span>
            </div>
          ) : (
            <div className={cn('w-full h-full overflow-hidden flex items-center justify-center', innerSizeClasses[size])}>
              <UserAvatar src={avatars[3]} name={names[3] || '?'} className={avatarClassName} />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative flex items-center justify-center bg-transparent', sizeClasses[size], className)}>
      {renderAvatars()}
    </div>
  )
}
