import { Play } from 'lucide-react'
import { VideoPlayer } from '@/components/common/video-player'
import type { SocialPostMedia } from './post-card'

interface MediaSectionProps {
  media: SocialPostMedia[]
  attachmentAlt: string
  onMediaClick?: (index: number) => void
}

function MediaTile({
  item,
  attachmentAlt,
  className,
  index = 0,
  onClick
}: {
  item: SocialPostMedia
  attachmentAlt: string
  className?: string
  index?: number
  onClick?: () => void
}) {
  const altText = `${attachmentAlt} ${index + 1}`

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-zinc-100 hover:opacity-90 transition-opacity dark:bg-zinc-800 cursor-pointer ${className || ''}`}
    >
      {item.type === 'VIDEO' ? (
        <>
          <VideoPlayer
            src={item.url}
            ariaLabel={altText}
            muted
            loop
            autoplay
            playsInline
            preload='metadata'
            className='pointer-events-none h-full w-full'
            objectFit='cover'
            controls={false}
          />
          <div className='absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-md'>
              <Play className='h-6 w-6 fill-white text-white' />
            </div>
          </div>
        </>
      ) : (
        <img
          src={item.url}
          alt={altText}
          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          loading='lazy'
          decoding='async'
        />
      )}
    </div>
  )
}

export function MediaSection({ media, attachmentAlt, onMediaClick }: MediaSectionProps) {
  if (!media?.length) return null

  const count = media.length
  
  // Ensure video is in the first slot by sorting before slicing
  const sortedMedia = [...media].sort((a, b) => {
    if (a.type === 'VIDEO' && b.type !== 'VIDEO') return -1
    if (a.type !== 'VIDEO' && b.type === 'VIDEO') return 1
    return 0
  })

  const displayMedia = sortedMedia.slice(0, 5)

  // Layout 1: Single item
  if (count === 1) {
    return (
      <div className='mt-3 sm:mt-4 -mx-4 sm:mx-0 overflow-hidden rounded-none sm:rounded-xl border-y sm:border border-zinc-200 dark:border-white/[0.08] lg:max-h-[600px]'>
        <MediaTile
          index={0}
          item={displayMedia[0]}
          attachmentAlt={attachmentAlt}
          className='max-h-[600px] w-full'
          onClick={() => onMediaClick?.(0)}
        />
      </div>
    )
  }

  // Layout 2: Two items side by side
  if (count === 2) {
    return (
      <div className='mt-3 sm:mt-4 -mx-4 sm:mx-0 grid h-[300px] grid-cols-2 gap-1 overflow-hidden rounded-none sm:rounded-xl sm:h-[400px]'>
        <MediaTile index={0} item={displayMedia[0]} attachmentAlt={attachmentAlt} onClick={() => onMediaClick?.(0)} />
        <MediaTile index={1} item={displayMedia[1]} attachmentAlt={attachmentAlt} onClick={() => onMediaClick?.(1)} />
      </div>
    )
  }

  // Layout 3: Three items - 1 large on top, 2 smaller on bottom
  if (count === 3) {
    return (
      <div className='mt-3 sm:mt-4 -mx-4 sm:mx-0 grid h-[350px] grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-none sm:rounded-xl sm:h-[450px]'>
        <MediaTile
          index={0}
          item={displayMedia[0]}
          attachmentAlt={attachmentAlt}
          className='col-span-2 h-full'
          onClick={() => onMediaClick?.(0)}
        />
        <MediaTile
          index={1}
          item={displayMedia[1]}
          attachmentAlt={attachmentAlt}
          className='h-full'
          onClick={() => onMediaClick?.(1)}
        />
        <MediaTile
          index={2}
          item={displayMedia[2]}
          attachmentAlt={attachmentAlt}
          className='h-full'
          onClick={() => onMediaClick?.(2)}
        />
      </div>
    )
  }

  // Layout 4: Four items - 2x2 grid
  if (count === 4) {
    return (
      <div className='mt-3 sm:mt-4 -mx-4 sm:mx-0 grid h-[350px] grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-none sm:rounded-xl sm:h-[450px]'>
        <MediaTile
          index={0}
          item={displayMedia[0]}
          attachmentAlt={attachmentAlt}
          className='h-full'
          onClick={() => onMediaClick?.(0)}
        />
        <MediaTile
          index={1}
          item={displayMedia[1]}
          attachmentAlt={attachmentAlt}
          className='h-full'
          onClick={() => onMediaClick?.(1)}
        />
        <MediaTile
          index={2}
          item={displayMedia[2]}
          attachmentAlt={attachmentAlt}
          className='h-full'
          onClick={() => onMediaClick?.(2)}
        />
        <MediaTile
          index={3}
          item={displayMedia[3]}
          attachmentAlt={attachmentAlt}
          className='h-full'
          onClick={() => onMediaClick?.(3)}
        />
      </div>
    )
  }

  // Layout 5+: Five or more items - 2 left, 3 right
  const extraCount = count > 5 ? count - 4 : 0
  return (
    <div className='mt-3 sm:mt-4 -mx-4 sm:mx-0 grid h-[400px] grid-cols-2 grid-rows-6 gap-1 overflow-hidden rounded-none sm:rounded-xl sm:h-[500px]'>
      <MediaTile index={0} item={displayMedia[0]} attachmentAlt={attachmentAlt} className='col-start-1 col-span-1 row-start-1 row-span-3 h-full' onClick={() => onMediaClick?.(0)} />
      <MediaTile index={1} item={displayMedia[1]} attachmentAlt={attachmentAlt} className='col-start-1 col-span-1 row-start-4 row-span-3 h-full' onClick={() => onMediaClick?.(1)} />
      <MediaTile index={2} item={displayMedia[2]} attachmentAlt={attachmentAlt} className='col-start-2 col-span-1 row-start-1 row-span-2 h-full' onClick={() => onMediaClick?.(2)} />
      <MediaTile index={3} item={displayMedia[3]} attachmentAlt={attachmentAlt} className='col-start-2 col-span-1 row-start-3 row-span-2 h-full' onClick={() => onMediaClick?.(3)} />
      <div className='relative h-full col-start-2 col-span-1 row-start-5 row-span-2'>
        <MediaTile index={4} item={displayMedia[4]} attachmentAlt={attachmentAlt} className='h-full' onClick={() => onMediaClick?.(4)} />
        {extraCount > 0 && (
          <div
            onClick={() => onMediaClick?.(4)}
            className='absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] cursor-pointer hover:bg-black/60 transition-colors'
          >
            <span className='text-3xl font-semibold text-white'>+{extraCount}</span>
          </div>
        )}
      </div>
    </div>
  )
}
