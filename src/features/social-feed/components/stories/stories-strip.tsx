import { useState, useMemo } from 'react'
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
  stats?: {
    viewCount?: number
    reactionCount?: number
    topReactions?: string[]
  } | null
  currentUserReaction?: string | null
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
  const currentUserAvatar = myProfile?.avatar || undefined

  const sortedStories = useMemo(() => {
    if (!myProfile?.id || !stories) return stories
    const myGroup = stories.find((g) => g.authorId === myProfile.id)
    const others = stories.filter((g) => g.authorId !== myProfile.id)
    if (myGroup) {
      return [myGroup, ...others]
    }
    return stories
  }, [stories, myProfile?.id])

  return (
    <section className='relative overflow-hidden w-full'>

      {isLoading ? (
        <div className='flex gap-2 overflow-hidden pb-1'>
          {Array.from({ length: 6 }).map((_, index) => (
            <StorySkeleton key={index} />
          ))}
        </div>
      ) : (
        <Carousel opts={{ align: 'start' }} className='w-full'>
          <CarouselContent className='ml-0 gap-2'>
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
            {sortedStories.map((group, index) => {
              const isMyStory = group.authorId === myProfile?.id
              return (
                <CarouselItem key={group.authorId} className='basis-auto pl-0'>
                  <StoryCard
                    authorName={isMyStory ? 'Your Story' : group.authorName}
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
              )
            })}
          </CarouselContent>

          <CarouselPrevious className='-left-3 h-11 w-11 rounded-full border border-zinc-200/80 bg-white/95 text-zinc-700 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:bg-zinc-900/95 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white' />
          <CarouselNext className='-right-3 h-11 w-11 rounded-full border border-zinc-200/80 bg-white/95 text-zinc-700 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:bg-zinc-900/95 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white' />
        </Carousel>
      )}

      <StoryViewerModal
        groups={sortedStories}
        open={isViewerOpen}
        initialGroupIndex={selectedGroupIndex}
        onOpenChange={setIsViewerOpen}
      />

      <StoryComposerModal open={isComposerOpen} onOpenChange={setIsComposerOpen} />
    </section>
  )
}
