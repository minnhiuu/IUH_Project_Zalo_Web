import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { StoryViewerPanel } from './story-viewer-panel'
import { REACTIONS, type ReactionType } from '../post/reaction-picker'
import { useSocialText } from '../../i18n/use-social-text'
import { useRecordStoryViewMutation, useToggleStoryReactionMutation, useDeleteStoryReactionMutation, useDeleteStoryMutation } from '../../queries/use-mutations'
import { useMyProfile } from '@/features/user/queries/use-queries'
import { StoryReactionsModal } from './story-reactions-modal'
import { StoryViewersModal } from './story-viewers-modal'
import type { SocialStory, StoryGroup } from './stories-strip'

interface StoryViewerModalProps {
  groups: StoryGroup[]
  open: boolean
  initialGroupIndex: number
  onOpenChange: (open: boolean) => void
}

export function StoryViewerModal({ groups, open, initialGroupIndex, onOpenChange }: StoryViewerModalProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex)
  const [storyIndex, setStoryIndex] = useState(0)
  // storyReactions: maps storyId → the currently-selected reaction type (null = no reaction)
  const [storyReactions, setStoryReactions] = useState<Record<string, ReactionType | null>>({})
  const [storyVolume, setStoryVolume] = useState(0)
  const [lastNonZeroVolume, setLastNonZeroVolume] = useState(0.7)
  const [isMusicPaused, setIsMusicPaused] = useState(false)
  const musicAudioRef = useRef<HTMLAudioElement | null>(null)
  
  // High-performance progress tracking using direct DOM manipulation
  const segmentRefs = useRef<Array<HTMLDivElement | null>>([])
  const elapsedRef = useRef(0)
  const progressAnimationRef = useRef<number | null>(null)

  const { text } = useSocialText()
  const { data: myProfile } = useMyProfile()
  const recordViewMutation = useRecordStoryViewMutation()
  const toggleReactionMutation = useToggleStoryReactionMutation()
  const deleteReactionMutation = useDeleteStoryReactionMutation()
  const deleteStoryMutation = useDeleteStoryMutation()

  const [showReactionsModal, setShowReactionsModal] = useState(false)
  const [showViewersModal, setShowViewersModal] = useState(false)

  // Sync when the modal opens or the initial group changes
  const [prevOpen, setPrevOpen] = useState(open)
  const [prevInitialGroupIndex, setPrevInitialGroupIndex] = useState(initialGroupIndex)
  if (open && (!prevOpen || initialGroupIndex !== prevInitialGroupIndex)) {
    setGroupIndex(initialGroupIndex)
    setStoryIndex(0)
    setStoryVolume(0)
    setLastNonZeroVolume(0.7)
    setPrevOpen(true)
    setPrevInitialGroupIndex(initialGroupIndex)
  } else if (!open && prevOpen) {
    setPrevOpen(false)
  }

  // Reset story index, progress, and volume whenever we switch groups
  const [prevGroupIndex, setPrevGroupIndex] = useState(initialGroupIndex)
  if (open && groupIndex !== prevGroupIndex) {
    setStoryIndex(0)
    setStoryVolume(0)
    setLastNonZeroVolume(0.7)
    setPrevGroupIndex(groupIndex)
  }

  // Reset volume, progress, and pause state whenever we switch stories within a group
  const [prevStoryIndex, setPrevStoryIndex] = useState(0)
  if (open && storyIndex !== prevStoryIndex) {
    setStoryVolume(0)
    setLastNonZeroVolume(0.7)
    setIsMusicPaused(false)
    elapsedRef.current = 0
    setPrevStoryIndex(storyIndex)
  }

  const currentGroup: StoryGroup | undefined = groups[groupIndex]
  const currentStories: SocialStory[] = currentGroup?.stories ?? []
  const currentStory: SocialStory | undefined = currentStories[storyIndex]

  const selectedReaction = currentStory ? (storyReactions[currentStory.id] ?? null) : null
  const isImageStoryWithMusic = currentStory?.mediaType !== 'VIDEO' && !!currentStory?.music?.audioUrl

  // Navigate to the previous story or previous user group
  function goBack() {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1)
    } else if (groupIndex > 0) {
      setGroupIndex((g) => g - 1)
      // storyIndex will reset via the groupIndex effect above
    }
  }

  // Navigate to the next story or next user group
  function goForward() {
    if (storyIndex < currentStories.length - 1) {
      setStoryIndex((i) => i + 1)
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((g) => g + 1)
    } else {
      onOpenChange(false) // Close modal if there are no more stories
    }
  }

  const hasPrev = groupIndex > 0 || storyIndex > 0
  const hasNext = storyIndex < currentStories.length - 1 || groupIndex < groups.length - 1

  // Auto-advancement timer for images (15 seconds)
  useEffect(() => {
    // Clear any existing loops
    if (progressAnimationRef.current) cancelAnimationFrame(progressAnimationRef.current)

    // Videos handle their own progress
    if (!open || !currentStory || currentStory.mediaType === 'VIDEO') {
      return
    }

    // Reset visual width immediately if it's a new story starting
    const activeSegment = segmentRefs.current[storyIndex]
    if (elapsedRef.current === 0 && activeSegment) {
      activeSegment.style.width = '0%'
    }

    if (isMusicPaused) {
      // Freezes in place; elapsedRef.current holds the progress so far
      return
    }

    const duration = 15000 // 15 seconds
    const startTimestamp = performance.now() - elapsedRef.current

    // Smooth UI progress via requestAnimationFrame (no React re-renders)
    const updateProgressUi = (time: number) => {
      const elapsed = time - startTimestamp
      elapsedRef.current = elapsed
      const progress = Math.min((elapsed / duration) * 100, 100)
      
      const el = segmentRefs.current[storyIndex]
      if (el) el.style.width = `${progress}%`

      if (progress < 100) {
        progressAnimationRef.current = requestAnimationFrame(updateProgressUi)
      } else {
        goForward()
      }
    }

    progressAnimationRef.current = requestAnimationFrame(updateProgressUi)

    return () => {
      if (progressAnimationRef.current) cancelAnimationFrame(progressAnimationRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, groupIndex, storyIndex, currentStory?.mediaType, isMusicPaused])

  // Background music for image stories
  useEffect(() => {
    if (!open || !isImageStoryWithMusic || !currentStory?.music?.audioUrl) {
      musicAudioRef.current?.pause()
      return
    }
    if (!musicAudioRef.current) musicAudioRef.current = new Audio()
    const audio = musicAudioRef.current
    audio.src = currentStory.music.audioUrl
    audio.loop = true
    audio.volume = storyVolume || 0.7
    setStoryVolume(0.7)
    setLastNonZeroVolume(0.7)

    if (isMusicPaused) {
      audio.pause()
    } else {
      audio.play().catch(() => { /* Autoplay blocked */ })
    }

    return () => { audio.pause() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, groupIndex, storyIndex, isMusicPaused])

  // Sync volume slider → audio element
  useEffect(() => {
    if (musicAudioRef.current && isImageStoryWithMusic) {
      musicAudioRef.current.volume = Math.max(0, Math.min(1, storyVolume))
    }
  }, [storyVolume, isImageStoryWithMusic])

  // Record VIEW interaction whenever the user sees a story
  useEffect(() => {
    if (!open || !currentStory?.id) return
    recordViewMutation.mutate(currentStory.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, groupIndex, storyIndex])

  if (!currentStory || !currentGroup) return null

  function handleReactionSelect(type: ReactionType) {
    if (!currentStory) return
    const storyId = currentStory.id
    const currentReaction = storyReactions[storyId] ?? null

    if (currentReaction === type) {
      // De-select: remove reaction optimistically, then call backend
      setStoryReactions((previous) => ({ ...previous, [storyId]: null }))
      deleteReactionMutation.mutate(storyId, {
        onError: () => {
          // Roll back on failure
          setStoryReactions((previous) => ({ ...previous, [storyId]: currentReaction }))
        }
      })
    } else {
      // Select / change reaction optimistically, then call backend
      setStoryReactions((previous) => ({ ...previous, [storyId]: type }))
      toggleReactionMutation.mutate({ postId: storyId, type }, {
        onError: () => {
          // Roll back on failure
          setStoryReactions((previous) => ({ ...previous, [storyId]: currentReaction }))
        }
      })
    }
  }

  function handleVolumeButtonClick() {
    if (storyVolume === 0) {
      setStoryVolume(lastNonZeroVolume)
      return
    }
    setLastNonZeroVolume(storyVolume)
    setStoryVolume(0)
  }

  function handleVolumeChange(value: number) {
    const normalizedVolume = Math.max(0, Math.min(1, value))
    setStoryVolume(normalizedVolume)
    if (normalizedVolume > 0) setLastNonZeroVolume(normalizedVolume)
  }

  function handleDeleteStory() {
    if (!currentStory) return
    if (window.confirm('Are you sure you want to delete this story?')) {
      deleteStoryMutation.mutate(currentStory.id, {
        onSuccess: () => {
          onOpenChange(false)
        }
      })
    }
  }

  const isMyStory = currentStory?.authorId === myProfile?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        aria-describedby={undefined}
        className='top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-none bg-transparent p-0 text-white sm:h-dvh sm:w-screen sm:max-w-none'
      >
        <DialogTitle className='sr-only'>Story viewer</DialogTitle>

        <div className='relative flex h-full w-full items-center justify-center bg-black/80 px-3 supports-backdrop-filter:backdrop-blur-2xl sm:px-6 transition-colors duration-500'>
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 opacity-80 mix-blend-multiply' />

          <StoryViewerPanel
            mediaUrl={currentStory.mediaUrl}
            mediaType={currentStory.mediaType}
            authorName={currentGroup.authorName}
            authorAvatar={currentGroup.authorAvatar}
            caption={currentStory.caption}
            music={currentStory.music}
            storyVolume={storyVolume}
            onVolumeButtonClick={handleVolumeButtonClick}
            onVolumeChange={handleVolumeChange}
            isMusicPaused={isMusicPaused}
            onPlayPauseClick={() => setIsMusicPaused((p) => !p)}
            onVideoTimeUpdate={(currentTime, duration) => {
              if (duration > 0 && currentStory.mediaType === 'VIDEO') {
                const el = segmentRefs.current[storyIndex]
                if (el) el.style.width = `${Math.min((currentTime / duration) * 100, 100)}%`
              }
            }}
            onVideoEnded={() => goForward()}

            headerTrailing={
              isMyStory && (
                <button
                  type="button"
                  onClick={handleDeleteStory}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/90 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-red-500/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  title="Delete story"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )
            }

            footer={
              isMyStory ? (
                <div className='flex items-center gap-6 rounded-full border border-white/10 bg-black/40 px-6 py-2.5 shadow-xl backdrop-blur-xl transition-all hover:bg-black/50'>
                  <div
                    className='flex items-center gap-2 cursor-pointer transition-colors hover:text-white/80'
                    title='Views'
                    onClick={() => setShowViewersModal(true)}
                  >
                    <Eye className='h-5 w-5 text-white/90' />
                    <span className='text-[15px] font-semibold tracking-wide text-white'>
                      {currentStory.stats?.viewCount || 0}
                    </span>
                  </div>
                  <div className='h-4 w-px bg-white/20' />
                  <div
                    className='flex items-center gap-2 cursor-pointer transition-colors hover:text-white/80'
                    title='Reactions'
                    onClick={() => setShowReactionsModal(true)}
                  >
                    {currentStory.stats?.topReactions && currentStory.stats.topReactions.length > 0 && (
                      <div className='flex -space-x-1 mr-1'>
                        {currentStory.stats.topReactions.slice(0, 3).map((reactionType, i) => {
                          const ReactionDef = REACTIONS.find((r) => r.type === reactionType)
                          if (!ReactionDef) return null
                          return (
                            <div key={i} className='rounded-full border border-black/20 bg-black/40 p-[2px] z-10'>
                              <ReactionDef.Icon size={14} />
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <span className='text-[15px] font-semibold tracking-wide text-white'>
                      {currentStory.stats?.reactionCount || 0}
                    </span>
                    <span className='text-[13px] font-medium text-white/80'>reactions</span>
                  </div>
                </div>
              ) : (
                <div className='flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2.5 shadow-xl backdrop-blur-xl transition-all hover:bg-black/50'>
                  {REACTIONS.map((reaction) => {
                    const isActive = selectedReaction === reaction.type
                    return (
                      <button
                        key={reaction.type}
                        type='button'
                        onClick={() => handleReactionSelect(reaction.type)}
                        title={text.reactions.labels[reaction.type]}
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-2xl leading-none transition-all duration-300 ${isActive ? 'scale-125 bg-white/20 ring-1 ring-white/50' : 'hover:scale-125 hover:bg-white/10'}`}
                      >
                        <reaction.Icon size={28} />
                      </button>
                    )
                  })}
                </div>
              )
            }
            overlay={
              <>
                {/* ── Segment indicator exactly at the top ─── */}
                {currentStories.length > 0 && (
                  <div className='absolute inset-x-0 top-0 z-50 flex items-start gap-1 px-4 pt-3'>
                    {currentStories.map((_, idx) => {
                      // Initial static state before JS takes over
                      let initialFill = '0%'
                      if (idx < storyIndex) initialFill = '100%'

                      return (
                        <button
                          key={idx}
                          type='button'
                          onClick={() => setStoryIndex(idx)}
                          className='h-1 flex-1 group py-2 focus-visible:outline-none'
                          aria-label={`Go to story ${idx + 1}`}
                        >
                          <div className='h-1 w-full overflow-hidden rounded-full bg-white/30 shadow-sm'>
                            <div
                              ref={el => { segmentRefs.current[idx] = el }}
                              className='h-full bg-white group-hover:bg-white/90'
                              style={{ 
                                width: initialFill,
                                // Only interpolate smoothly for video segments so native timeupdate gaps are hidden
                                transition: idx === storyIndex && currentStory?.mediaType === 'VIDEO' ? 'width 300ms linear' : 'none'
                              }}
                            />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                <button
                  type='button'
                  disabled={!hasPrev}
                  onClick={goBack}
                  className='absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-black/40'
                >
                  <ChevronLeft className='h-6 w-6' />
                </button>
                <button
                  type='button'
                  disabled={!hasNext}
                  onClick={goForward}
                  className='absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-black/40'
                >
                  <ChevronRight className='h-6 w-6' />
                </button>
              </>
            }
          />
        </div>
      </DialogContent>
      {showReactionsModal && currentStory && (
        <StoryReactionsModal
          open={showReactionsModal}
          onOpenChange={setShowReactionsModal}
          targetId={currentStory.id}
          targetType='POST'
          initialReactionType={(currentStory.stats?.topReactions?.[0] as ReactionType) || 'LIKE'}
        />
      )}

      {showViewersModal && currentStory && (
        <StoryViewersModal
          open={showViewersModal}
          onOpenChange={setShowViewersModal}
          targetId={currentStory.id}
        />
      )}
    </Dialog>
  )
}
