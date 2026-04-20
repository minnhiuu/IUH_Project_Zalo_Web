import { UserAvatar } from '@/components/common/user-avatar'
import { StoryVideoPlayer } from './story-video-player'

interface StoryCardProps {
  authorName: string
  authorAvatar?: string | null
  mediaUrl?: string | null
  mediaType?: 'IMAGE' | 'VIDEO' | null
  caption?: string | null
  mediaAlt: string
  onClick?: () => void
}

export function StoryCard({
  authorName,
  authorAvatar,
  mediaUrl,
  mediaType,
  caption,
  mediaAlt,
  onClick
}: StoryCardProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='group relative h-[240px] w-[140px] shrink-0 overflow-hidden rounded-[20px] bg-zinc-100 text-left shadow-sm ring-1 ring-zinc-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-indigo-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-900 dark:ring-white/10 dark:hover:ring-indigo-400/40'
    >
      {mediaUrl ? (
        mediaType === 'VIDEO' ? (
          <StoryVideoPlayer
            src={mediaUrl}
            className='h-full w-full pointer-events-none'
            videoClassName='h-full w-full transition-transform duration-500 group-hover:scale-105'
            objectFit='cover'
            ariaLabel={caption || mediaAlt}
            controls={false}
            autoplay
            muted
            loop
            playsInline
            preload='metadata'
          />
        ) : (
          <img
            src={mediaUrl}
            alt={caption || mediaAlt}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        )
      ) : (
        <div className='h-full w-full bg-gradient-to-br from-indigo-500/30 via-sky-500/20 to-emerald-500/20 dark:from-indigo-500/40 dark:via-sky-500/30 dark:to-emerald-500/30' />
      )}

      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/90' />

      <div className='absolute left-3 top-3'>
        <div className='rounded-full border-[2.5px] border-indigo-500 p-[2px] shadow-md transition-transform duration-300 group-hover:scale-105'>
          <div className='h-8 w-8'>
            <UserAvatar
              name={authorName}
              src={authorAvatar}
              className='w-full h-full border border-background'
              fallbackClassName='bg-primary text-white font-semibold text-xs'
            />
          </div>
        </div>
      </div>

      <div className='absolute inset-x-0 bottom-0 p-3.5'>
        <p className='line-clamp-2 text-[13px] font-semibold tracking-wide text-white drop-shadow-md'>{authorName}</p>
      </div>
    </button>
  )
}
