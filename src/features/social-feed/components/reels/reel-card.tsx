import { useEffect } from 'react'
import type { SocialPost } from '../post/post-card'
import { ReelVideoPlayer } from './reel-video-player'
import { useSocialText } from '../../i18n/use-social-text'

interface ReelCardProps {
  reel: SocialPost
  isActive: boolean
}

function getFirstVideo(reel: SocialPost) {
  return reel.media?.find((item) => item.type === 'VIDEO') ?? null
}

export function ReelCard({ reel, isActive }: ReelCardProps) {
  const { text } = useSocialText()
  const videoMedia = getFirstVideo(reel)

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return
    }

    console.info('[ReelCard] selected reel video source', {
      reelId: reel.id,
      source: videoMedia?.url ?? null
    })
  }, [reel.id, videoMedia?.url])

  return (
    <article
      id={`reel-${reel.id}`}
      className='relative h-full w-full overflow-hidden rounded-[24px] bg-zinc-100 dark:bg-zinc-950 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-300 ease-out'
    >
      {videoMedia ? (
        <ReelVideoPlayer
          src={videoMedia.url}
          ariaLabel={reel.content || reel.authorName}
          shouldPlay={isActive}
          className='h-full w-full'
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-950 text-zinc-500'>
          <p className='text-sm font-medium tracking-wide'>{text.reels.noVideo}</p>
        </div>
      )}
    </article>
  )
}
