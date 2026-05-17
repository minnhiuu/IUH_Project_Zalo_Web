import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Eye, Trash2, X, Plus, MoreHorizontal } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { StoryViewerPanel } from './story-viewer-panel'
import { REACTIONS, type ReactionType } from '../post/reaction-picker'
import { useSocialText } from '../../i18n/use-social-text'
import {
  useRecordStoryViewMutation,
  useToggleStoryReactionMutation,
  useDeleteStoryReactionMutation,
  useDeleteStoryMutation
} from '../../queries/use-mutations'
import { useMyProfile } from '@/features/user/queries/use-queries'
import { useStoryViewers } from '../../queries/use-queries'
import { StoryReactionsModal } from './story-reactions-modal'
import { UserAvatar } from '@/components/common/user-avatar'
import { cn } from '@/lib/utils'
import type { SocialStory, StoryGroup } from './stories-strip'
import { ScrollArea } from '@/components/ui/scroll-area'

interface StoryViewerModalProps {
  groups: StoryGroup[]
  open: boolean
  initialGroupIndex: number
  onOpenChange: (open: boolean) => void
}

export function StoryViewerModal({ groups, open, initialGroupIndex, onOpenChange }: StoryViewerModalProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex)
  const [storyIndex, setStoryIndex] = useState(0)
  const [storyReactions, setStoryReactions] = useState<Record<string, ReactionType | null>>({})
  const [storyVolume, setStoryVolume] = useState(0)
  const [lastNonZeroVolume, setLastNonZeroVolume] = useState(0.7)
  const [isMusicPaused, setIsMusicPaused] = useState(false)
  const musicAudioRef = useRef<HTMLAudioElement | null>(null)

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
  const [showViewersPanel, setShowViewersPanel] = useState(false)

  // Sync when the modal opens or the initial group changes
  useEffect(() => {
    if (open) {
      setGroupIndex(initialGroupIndex)
      setStoryIndex(0)
      setStoryVolume(0.7)
      setLastNonZeroVolume(0.7)
      setIsMusicPaused(false)
      elapsedRef.current = 0
    }
  }, [open, initialGroupIndex])

  // Reset story index, progress, and volume whenever we switch groups
  useEffect(() => {
    if (open) {
      setStoryIndex(0)
      elapsedRef.current = 0
      setIsMusicPaused(false)
    }
  }, [groupIndex, open])

  // Reset volume, progress, and pause state whenever we switch stories within a group
  useEffect(() => {
    if (open) {
      elapsedRef.current = 0
      setIsMusicPaused(false)
    }
  }, [storyIndex, open])

  const currentGroup: StoryGroup | undefined = groups[groupIndex]
  const currentStories: SocialStory[] = currentGroup?.stories ?? []
  const currentStory: SocialStory | undefined = currentStories[storyIndex]

  const selectedReaction = currentStory ? (storyReactions[currentStory.id] ?? null) : null
  const isImageStoryWithMusic = currentStory?.mediaType !== 'VIDEO' && !!currentStory?.music?.audioUrl

  function goBack() {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1)
    } else if (groupIndex > 0) {
      setGroupIndex((g) => g - 1)
    }
  }

  function goForward() {
    if (storyIndex < currentStories.length - 1) {
      setStoryIndex((i) => i + 1)
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((g) => g + 1)
    } else {
      onOpenChange(false)
    }
  }

  const hasPrev = groupIndex > 0 || storyIndex > 0
  const hasNext = storyIndex < currentStories.length - 1 || groupIndex < groups.length - 1

  useEffect(() => {
    if (progressAnimationRef.current) cancelAnimationFrame(progressAnimationRef.current)
    if (!open || !currentStory || currentStory.mediaType === 'VIDEO') return

    const activeSegment = segmentRefs.current[storyIndex]
    if (elapsedRef.current === 0 && activeSegment) {
      activeSegment.style.width = '0%'
    }

    if (isMusicPaused) return

    const duration = 15000
    const startTimestamp = performance.now() - elapsedRef.current

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
  }, [open, groupIndex, storyIndex, currentStory?.mediaType, isMusicPaused])

  useEffect(() => {
    if (!open || !isImageStoryWithMusic || !currentStory?.music?.audioUrl) {
      musicAudioRef.current?.pause()
      return
    }
    if (!musicAudioRef.current) musicAudioRef.current = new Audio()
    const audio = musicAudioRef.current
    audio.src = currentStory.music.audioUrl
    audio.loop = true
    audio.volume = storyVolume

    if (isMusicPaused) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }

    return () => {
      audio.pause()
    }
  }, [open, groupIndex, storyIndex, isMusicPaused, isImageStoryWithMusic, currentStory?.music?.audioUrl])

  useEffect(() => {
    if (musicAudioRef.current && isImageStoryWithMusic) {
      musicAudioRef.current.volume = Math.max(0, Math.min(1, storyVolume))
    }
  }, [storyVolume, isImageStoryWithMusic])

  useEffect(() => {
    if (!open || !currentStory?.id) return
    recordViewMutation.mutate(currentStory.id)
  }, [open, groupIndex, storyIndex, currentStory?.id])

  const isMyStory = currentStory?.authorId === myProfile?.id
  const myGroup = groups.find((g) => g.authorId === myProfile?.id)
  const otherGroups = groups.filter((g) => g.authorId !== myProfile?.id)

  // ── Viewer Details Data ───────────────────────────────────────
  const { data: viewersPage, isLoading: loadingViewers } = useStoryViewers(
    currentStory?.id || '',
    0,
    100,
    showViewersPanel && !!currentStory?.id
  )

  const viewers = viewersPage?.data || []

  if (!currentStory || !currentGroup) return null

  function handleReactionSelect(type: ReactionType) {
    if (!currentStory) return
    const storyId = currentStory.id
    const currentReaction = storyReactions[storyId] ?? null

    if (currentReaction === type) {
      setStoryReactions((previous) => ({ ...previous, [storyId]: null }))
      deleteReactionMutation.mutate(storyId, {
        onError: () => setStoryReactions((previous) => ({ ...previous, [storyId]: currentReaction }))
      })
    } else {
      setStoryReactions((previous) => ({ ...previous, [storyId]: type }))
      toggleReactionMutation.mutate(
        { postId: storyId, type },
        {
          onError: () => setStoryReactions((previous) => ({ ...previous, [storyId]: currentReaction }))
        }
      )
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
        onSuccess: () => onOpenChange(false)
      })
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className='fixed top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-none bg-background p-0 sm:h-dvh sm:w-screen sm:max-w-none z-[200]'
      >
        <DialogTitle className='sr-only'>Story viewer</DialogTitle>

        <div className='flex h-full w-full'>
          {/* ── Sidebar (Left) ── */}
          <aside className='flex w-[360px] flex-col border-r border-border bg-background dark:bg-card shadow-2xl z-20 text-foreground'>
            <div className='flex items-center gap-3 p-4 pb-2'>
              <button
                onClick={() => onOpenChange(false)}
                className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-secondary-hover'
              >
                <X className='h-6 w-6' />
              </button>
              <div className='flex h-10 w-10 items-center justify-center rounded-full'>
                <img src='/images/logo.svg' alt='Logo' className='h-8 w-8' />
              </div>
            </div>

            <div className='px-6 py-2'>
              <h1 className='text-[24px] font-bold tracking-tight'>{text.stories.title}</h1>
            </div>

            <ScrollArea className='flex-1 px-3 pb-4'>
              {/* Tin của bạn */}
              <div className='mt-4 px-3 mb-2'>
                <h2 className='text-[17px] font-bold'>{text.storyViewer.yourStory}</h2>
              </div>

              {myGroup ? (
                <button
                  onClick={() => setGroupIndex(groups.indexOf(myGroup))}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl p-3 transition-all hover:bg-accent',
                    groupIndex === groups.indexOf(myGroup) && 'bg-accent'
                  )}
                >
                  <div className='relative'>
                    <UserAvatar
                      name={myGroup.authorName}
                      src={myGroup.authorAvatar}
                      className='h-[60px] w-[60px] ring-2 ring-primary ring-offset-2 ring-offset-background'
                    />
                    <div className='absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground'>
                      <Plus className='h-4 w-4' />
                    </div>
                  </div>
                  <div className='flex-1 text-left'>
                    <p className='font-bold leading-tight'>{myGroup.authorName}</p>
                    <p className='text-[13px] text-muted-foreground mt-1'>
                      {text.storyViewer.hoursAgo.replace('{{count}}', '1')}
                    </p>
                  </div>
                </button>
              ) : (
                <div className='flex items-center gap-3 p-3 opacity-60'>
                  <div className='relative'>
                    <UserAvatar
                      name={myProfile?.fullName || ''}
                      src={myProfile?.avatar}
                      className='h-[60px] w-[60px]'
                    />
                    <div className='absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground'>
                      <Plus className='h-4 w-4' />
                    </div>
                  </div>
                  <div className='flex-1'>
                    <p className='font-bold'>{myProfile?.fullName || text.composer.me}</p>
                    <p className='text-[13px] text-primary font-medium'>{text.storyViewer.addToStory}</p>
                  </div>
                </div>
              )}

              {/* Tất cả tin */}
              <div className='mt-6 px-3 mb-2'>
                <h2 className='text-[17px] font-bold'>{text.storyViewer.allStories}</h2>
              </div>

              <div className='space-y-1'>
                {otherGroups.map((group, idx) => {
                  const actualIdx = groups.indexOf(group)
                  return (
                    <button
                      key={group.authorId}
                      onClick={() => setGroupIndex(actualIdx)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl p-3 transition-all hover:bg-accent',
                        groupIndex === actualIdx && 'bg-accent'
                      )}
                    >
                      <UserAvatar
                        name={group.authorName}
                        src={group.authorAvatar}
                        className={cn(
                          'h-[60px] w-[60px]',
                          groupIndex !== actualIdx && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        )}
                      />
                      <div className='flex-1 text-left'>
                        <p className='font-bold leading-tight'>{group.authorName}</p>
                        <p className='text-[13px] text-muted-foreground mt-1'>
                          {text.storyViewer.newCards.replace('{{count}}', String(group.stories.length))} · 27{' '}
                          {text.storyViewer.minutesAgo.replace('{{count}}', '')}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </aside>

          {/* ── Main Viewer Area (Right) ── */}
          <main className='relative flex flex-1 flex-col items-center justify-center bg-black overflow-hidden'>
            {/* Background blur layers (Outer loang màu) */}
            <div className='absolute inset-0 z-0 overflow-hidden'>
              <img
                src={currentStory.mediaUrl || ''}
                className='h-full w-full object-cover blur-[80px] opacity-20 scale-125'
                alt=''
              />
            </div>

            {/* Top Right Utility Icons (Mock Facebook UI) */}
            <div className='absolute right-6 top-6 z-50 flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer'>
                <MoreHorizontal className='h-6 w-6' />
              </div>
            </div>

            {/* Navigation Arrows (Outside the card) */}
            <button
              type='button'
              disabled={!hasPrev}
              onClick={goBack}
              className='absolute left-8 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-0'
            >
              <ChevronLeft className='h-8 w-8' />
            </button>
            <button
              type='button'
              disabled={!hasNext}
              onClick={goForward}
              className='absolute right-8 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-0'
            >
              <ChevronRight className='h-8 w-8' />
            </button>

            {/* Viewer Panel */}
            <div
              className={cn(
                'relative transition-all duration-500 ease-in-out',
                showViewersPanel ? 'scale-95 opacity-50' : 'scale-100'
              )}
            >
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
                      type='button'
                      onClick={handleDeleteStory}
                      className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-destructive'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  )
                }
                footer={
                  isMyStory ? (
                    <div className='flex items-center gap-6 rounded-full border border-white/10 bg-black/40 px-6 py-2.5 shadow-xl backdrop-blur-xl transition-all hover:bg-black/50'>
                      <div
                        className='flex items-center gap-2 cursor-pointer transition-colors hover:text-white/80'
                        title='Views'
                        onClick={() => setShowViewersPanel(true)}
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
                              const ReactionDef = REACTIONS.find((r) => r.type === reactionType.toUpperCase())
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
                        <span className='text-[13px] font-medium text-white/80 ml-1'>reactions</span>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center gap-3 rounded-full bg-black/40 px-4 py-2.5 backdrop-blur-xl'>
                      {REACTIONS.map((reaction) => (
                        <button
                          key={reaction.type}
                          onClick={() => handleReactionSelect(reaction.type)}
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full text-2xl transition-all hover:scale-125 hover:bg-white/10',
                            selectedReaction === reaction.type && 'scale-125 bg-white/20'
                          )}
                        >
                          <reaction.Icon size={28} />
                        </button>
                      ))}
                    </div>
                  )
                }
                overlay={
                  <div className='absolute inset-x-0 top-0 z-50 flex items-start gap-1 px-4 pt-3'>
                    {currentStories.map((_, idx) => (
                      <div key={idx} className='h-1 flex-1 overflow-hidden rounded-full bg-white/30'>
                        <div
                          ref={(el) => {
                            segmentRefs.current[idx] = el
                          }}
                          className='h-full bg-white'
                          style={{
                            width: idx < storyIndex ? '100%' : '0%',
                            transition:
                              idx === storyIndex && currentStory?.mediaType === 'VIDEO' ? 'width 300ms linear' : 'none'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                }
              />
            </div>

            {/* ── Viewers Detail Panel Overlay ── */}
            {showViewersPanel && (
              <div className='absolute inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300'>
                <div className='relative w-full max-w-[440px] h-[75dvh] bg-background dark:bg-card rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-500'>
                  <div className='flex items-center justify-center p-4 border-b border-border'>
                    <h3 className='text-[18px] font-bold text-foreground'>{text.storyViewer.details}</h3>
                    <button
                      onClick={() => setShowViewersPanel(false)}
                      className='absolute right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors'
                    >
                      <X className='h-5 w-5 text-foreground' />
                    </button>
                  </div>

                  <ScrollArea className='flex-1 p-4'>
                    <div className='flex gap-4 mb-6'>
                      <div className='relative w-[80px] h-[140px] rounded-lg overflow-hidden border-2 border-border shrink-0 shadow-sm'>
                        {/* Thumbnail of story with loang màu bg */}
                        <div className='absolute inset-0 bg-black'>
                          <img
                            src={currentStory.mediaUrl || ''}
                            className='h-full w-full object-cover blur-md opacity-50'
                            alt=''
                          />
                          <img
                            src={currentStory.mediaUrl || ''}
                            className='absolute inset-0 h-full w-full object-contain z-10'
                            alt=''
                          />
                        </div>
                      </div>
                      <div className='flex flex-col justify-center items-center w-[100px] h-[140px] border-2 border-dashed border-border rounded-lg bg-muted/50 transition-colors hover:bg-muted cursor-pointer group'>
                        <div className='h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground mb-2 group-hover:scale-110 transition-transform'>
                          <Plus className='h-6 w-6' />
                        </div>
                        <span className='text-[12px] font-bold text-primary text-center leading-tight'>
                          {text.storyViewer.addToStory}
                        </span>
                      </div>
                    </div>

                    <div className='h-[1px] bg-border mb-4' />

                    <div className='flex items-center gap-2 mb-4'>
                      <Eye className='h-5 w-5 text-muted-foreground' />
                      <span className='text-[16px] font-bold text-foreground'>
                        {text.storyViewer.viewersCount.replace('{{count}}', String(currentStory.stats?.viewCount || 0))}
                      </span>
                    </div>

                    <div className='space-y-1'>
                      {loadingViewers ? (
                        <div className='flex items-center justify-center py-8'>
                          <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        </div>
                      ) : viewers.length > 0 ? (
                        viewers.map((viewer: any) => (
                          <div
                            key={viewer.id}
                            className='flex items-center justify-between p-2 rounded-xl hover:bg-accent transition-colors'
                          >
                            <div className='flex items-center gap-3'>
                              <UserAvatar
                                name={viewer.authorInfo?.fullName || 'User'}
                                src={viewer.authorInfo?.avatar}
                                className='h-12 w-12 border border-border'
                              />
                              <div className='flex flex-col'>
                                <p className='font-bold text-[16px] text-foreground'>
                                  {viewer.authorInfo?.fullName || 'User'}
                                </p>
                                <p className='text-[13px] text-muted-foreground'>
                                  {text.storyViewer.activeMinutesAgo.replace('{{count}}', '10')}
                                </p>
                              </div>
                            </div>
                            {/* reactionType is not available in current API, so we hide it */}
                          </div>
                        ))
                      ) : (
                        <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
                          <Eye className='h-12 w-12 mb-2 opacity-20' />
                          <p className='text-sm'>{text.storyViewer.noViewers || 'No viewers yet'}</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </main>
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
    </Dialog>
  )
}
