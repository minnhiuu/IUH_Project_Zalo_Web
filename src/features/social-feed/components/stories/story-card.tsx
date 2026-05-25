import { UserAvatar } from '@/components/common/user-avatar'
import { StoryVideoPlayer } from './story-video-player'
import { useNavigate } from 'react-router'

interface StoryCardProps {
  authorId?: string
  authorName: string
  displayName?: string
  authorAvatar?: string | null
  mediaUrl?: string | null
  mediaType?: 'IMAGE' | 'VIDEO' | null
  caption?: string | null
  mediaAlt: string
  onClick?: () => void
  hasUnviewedStories?: boolean
}

export function StoryCard({
  authorId,
  authorName,
  displayName,
  authorAvatar,
  mediaUrl,
  mediaType,
  caption,
  mediaAlt,
  onClick,
  hasUnviewedStories = true
}: StoryCardProps) {
  const finalDisplayName = displayName || authorName
  const navigate = useNavigate()

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!authorId) return
    e.stopPropagation()
    navigate(`/profile/${authorId}`)
  }

  return (
    <button
      type='button'
      onClick={onClick}
      className="group relative h-[250px] w-[140px] shrink-0 overflow-hidden rounded-[12px] bg-zinc-100 text-left shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-zinc-900"
    >
      <div className={`pointer-events-none absolute inset-0 z-20 rounded-[12px] ${
        hasUnviewedStories
          ? 'ring-[3px] ring-inset ring-blue-500 dark:ring-blue-500'
          : 'ring-[3px] ring-inset ring-white/90 dark:ring-zinc-700'
      }`} />
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
        <div className='h-full w-full bg-gradient-to-br from-primary/30 via-sky-500/20 to-emerald-500/20 dark:from-primary/40 dark:via-sky-500/30 dark:to-emerald-500/30' />
      )}

      <div className='absolute inset-0 bg-black/10 transition-opacity duration-200 group-hover:bg-black/20' />

      <div className='absolute left-3 top-3 z-10'>
        <div 
          role="button"
          tabIndex={0}
          onClick={handleProfileClick}
          className={`h-10 w-10 overflow-hidden rounded-full border-[3px] transition-transform duration-300 hover:scale-110 ${
          hasUnviewedStories ? 'border-blue-500 dark:border-blue-500' : 'border-white/90 dark:border-zinc-700'
        }`}>
          <UserAvatar
            name={authorName}
            src={authorAvatar}
            className='h-full w-full border border-black/10'
            fallbackClassName='bg-primary text-white font-semibold text-xs'
          />
        </div>
      </div>

      <div className='absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10'>
        <p className='line-clamp-2 text-[13px] font-semibold text-white drop-shadow-md'>{finalDisplayName}</p>
      </div>
    </button>
  )
}
