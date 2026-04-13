import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { useMyProfile } from '@/features/user/queries/use-queries'
import { useSocialText } from '../../i18n/use-social-text'
import { StoryCreateCard } from './story-create-card'
import { StoryCard } from './story-card'
import { StorySkeleton } from './story-skeleton'
import { StoryViewerModal } from './story-viewer-modal'
import { StoryComposerModal } from './story-composer-modal'

/** A single story post for one user. */
export interface SocialStory {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string | null
  mediaUrl?: string | null
  mediaType?: 'IMAGE' | 'VIDEO' | null
  caption?: string | null
  expiresAt?: string | null
  music?: {
    jamendoId?: string | null
    title?: string | null
    artistName?: string | null
    audioUrl?: string | null
    coverUrl?: string | null
    duration?: number | null
    albumName?: string | null
  } | null
}

/** All stories from a single user, grouped together. */
export interface StoryGroup {
  authorId: string
  authorName: string
  authorAvatar?: string | null
  stories: SocialStory[]
}

interface StoriesStripProps {
  stories: StoryGroup[]
  isLoading?: boolean
}

export function StoriesStrip({ stories, isLoading = false }: StoriesStripProps) {
  const { text } = useSocialText()
  const { data: myProfile } = useMyProfile()
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0)

  const currentUserName = myProfile?.fullName?.trim() || text.composer.me
  const currentUserAvatar =
    myProfile?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(currentUserName)}`

  return (
    <section className='relative overflow-hidden rounded-[28px] border border-zinc-200/60 bg-white/60 p-5 shadow-sm backdrop-blur-xl transition-all duration-500 hover:border-zinc-300/60 hover:shadow-md dark:border-white/5 dark:bg-zinc-950/40 dark:hover:border-white/10'>
      <div className='mb-5 flex items-center justify-between px-2'>
        <div className='flex items-center gap-2.5'>
          <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 ring-1 ring-indigo-500/20 dark:from-indigo-500/30 dark:to-purple-500/30 dark:text-indigo-400'>
            <Sparkles className='h-4.5 w-4.5' />
          </div>
          <h3 className='text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100'>
            {text.stories.title}
          </h3>
        </div>
      </div>

      {isLoading ? (
        <div className='flex gap-3 overflow-hidden pb-1 px-1'>
          {Array.from({ length: 6 }).map((_, index) => (
            <StorySkeleton key={index} />
          ))}
        </div>
      ) : (
        <Carousel opts={{ align: 'start' }} className='w-full px-2'>
          <CarouselContent className='ml-0 gap-3'>
            {/* Create card always first */}
            <CarouselItem className='basis-auto pl-0'>
              <StoryCreateCard
                backgroundImageUrl={currentUserAvatar}
                alt={text.stories.itemAlt(currentUserName)}
                title={text.stories.create}
                onClick={() => setIsComposerOpen(true)}
              />
            </CarouselItem>

            {/* One card per user group */}
            {stories.map((group, index) => (
              <CarouselItem key={group.authorId} className='basis-auto pl-0'>
                <StoryCard
                  authorName={group.authorName}
                  authorAvatar={group.authorAvatar}
                  mediaUrl={group.stories[0]?.mediaUrl}
                  mediaType={group.stories[0]?.mediaType}
                  caption={group.stories[0]?.caption}
                  mediaAlt={text.stories.itemAlt(group.authorName)}
                  onClick={() => {
                    setSelectedGroupIndex(index)
                    setIsViewerOpen(true)
                  }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className='-left-3 h-11 w-11 rounded-full border border-zinc-200/80 bg-white/95 text-zinc-700 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:bg-zinc-900/95 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white' />
          <CarouselNext className='-right-3 h-11 w-11 rounded-full border border-zinc-200/80 bg-white/95 text-zinc-700 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:bg-zinc-900/95 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white' />
        </Carousel>
      )}

      <StoryViewerModal
        groups={stories}
        open={isViewerOpen}
        initialGroupIndex={selectedGroupIndex}
        onOpenChange={setIsViewerOpen}
      />

      <StoryComposerModal
        open={isComposerOpen}
        onOpenChange={setIsComposerOpen}
      />
    </section>
  )
}
