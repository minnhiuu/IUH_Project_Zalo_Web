import { useState } from 'react'
import { Play } from 'lucide-react'
import type { SocialPost } from '@/features/social-feed/components/post/post-card'
import { PostMediaModal } from '@/features/social-feed/components/post/post-media-modal'

interface ProfileReelsGridProps {
  reels: SocialPost[]
}

export function ProfileReelsGrid({ reels }: ProfileReelsGridProps) {
  const [selectedReel, setSelectedReel] = useState<SocialPost | null>(null)

  if (reels.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-14 text-center dark:border-white/10 dark:bg-[#242526]'>
        <p className='text-[15px] font-medium text-zinc-500 dark:text-zinc-400'>No reels found</p>
      </div>
    )
  }

  return (
    <>
      <div className='grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-2'>
        {reels.map((reel) => {
          const videoMedia = reel.media?.find((m) => m.type === 'VIDEO')

          return (
            <div
              key={reel.id}
              onClick={() => setSelectedReel(reel)}
              className='group relative aspect-[9/16] cursor-pointer overflow-hidden bg-zinc-200 dark:bg-zinc-800'
            >
              {videoMedia ? (
                <video
                  src={videoMedia.url}
                  className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                  preload='metadata'
                  muted
                  playsInline
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-zinc-300 dark:bg-zinc-700'>
                  <Play className='h-8 w-8 text-white/50' />
                </div>
              )}

              {/* Overlay with play icon and stats */}
              <div className='absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-80 transition-opacity group-hover:opacity-100'>
                <div className='flex justify-end'>
                  <div className='flex items-center gap-1 text-white'>
                    <Play className='h-4 w-4 fill-white' />
                    <span className='text-xs font-semibold'>{reel.views ?? reel.reactions ?? 0}</span>
                  </div>
                </div>
                <div className='line-clamp-2 text-xs font-medium text-white drop-shadow-md'>
                  {reel.content}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedReel && (
        <PostMediaModal
          open={!!selectedReel}
          onOpenChange={(open) => !open && setSelectedReel(null)}
          post={selectedReel}
        />
      )}
    </>
  )
}
