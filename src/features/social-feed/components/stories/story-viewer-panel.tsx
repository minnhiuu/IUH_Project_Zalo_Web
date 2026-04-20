import type { ReactNode } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { StoryVideoPlayer } from './story-video-player'
import type { SocialStory } from './stories-strip'

export interface StoryViewerPanelProps {
  // Media
  mediaUrl?: string | null
  mediaType?: 'IMAGE' | 'VIDEO' | null
  mediaAlt?: string

  // Author
  authorName: string
  authorAvatar?: string | null

  // Content
  caption?: string | null

  // Music (from backend PostMusic)
  music?: SocialStory['music']

  // Video volume (only relevant when mediaType === 'VIDEO')
  storyVolume?: number
  onVolumeButtonClick?: () => void
  onVolumeChange?: (value: number) => void
  isMusicPaused?: boolean
  onPlayPauseClick?: () => void

  // Slots
  /** Extra node rendered inside the top-right of the header row (when no volume control) */
  headerTrailing?: ReactNode
  /** Extra node rendered pinned at the bottom of the panel */
  footer?: ReactNode
  /** Overlay children rendered above the panel at z-20 */
  overlay?: ReactNode
  /** Replaces the media area when no mediaUrl is supplied */
  emptyState?: ReactNode

  onVideoTimeUpdate?: (currentTime: number, duration: number) => void
  onVideoEnded?: () => void
}

export function StoryViewerPanel({
  mediaUrl,
  mediaType,
  mediaAlt,
  authorName,
  authorAvatar,
  caption,
  music,
  storyVolume = 0,
  onVolumeButtonClick,
  onVolumeChange,
  isMusicPaused,
  onPlayPauseClick,
  headerTrailing,
  footer,
  overlay,
  emptyState,
  onVideoTimeUpdate,
  onVideoEnded
}: StoryViewerPanelProps) {
  return (
    <div className='relative h-[88dvh] w-[min(96vw,440px)] overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl ring-1 ring-white/5'>
      {/* ── Media ───────────────────────────────────────────────────── */}
      <div className='flex h-full w-full items-center justify-center bg-black'>
        {mediaUrl ? (
          mediaType === 'VIDEO' ? (
            <StoryVideoPlayer
              src={mediaUrl}
              className='h-full w-full'
              videoClassName='h-full w-full'
              objectFit='contain'
              ariaLabel={mediaAlt ?? caption ?? authorName}
              controls={false}
              allowTapPlayPause
              autoPlay
              muted={storyVolume === 0}
              volume={storyVolume}
              loop={false}
              playsInline
              preload='auto'
              onTimeUpdate={onVideoTimeUpdate}
              onEnded={onVideoEnded}
            />
          ) : (
            <img src={mediaUrl} alt={mediaAlt ?? caption ?? authorName} className='h-full w-full object-contain' />
          )
        ) : emptyState ? (
          emptyState
        ) : (
          <div className='h-full w-full bg-gradient-to-br from-indigo-500/50 via-sky-500/40 to-emerald-500/40' />
        )}
      </div>

      {/* ── Gradient overlay ─────────────────────────────────────────── */}
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 opacity-90' />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className='absolute inset-x-0 top-0 z-10 px-4 pt-8 pb-4'>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10'>
            <UserAvatar
              name={authorName}
              src={authorAvatar}
              className='w-full h-full border border-background'
              fallbackClassName='bg-primary text-white text-xs font-semibold'
            />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-semibold tracking-wide text-white drop-shadow-md leading-tight'>{authorName}</p>
            {/* Music badge — inline under author name */}
            {music?.title ? (
              <div className='mt-1 flex items-center gap-1.5'>
                {music.coverUrl ? (
                  <img
                    src={music.coverUrl}
                    alt={music.title}
                    className='h-3.5 w-3.5 shrink-0 rounded-full object-cover ring-1 ring-white/20'
                  />
                ) : (
                  <div
                    className='h-3 w-3 shrink-0 animate-spin rounded-full'
                    style={{ background: 'conic-gradient(#8b5cf6, transparent)', animationDuration: '3s' }}
                  />
                )}
                <p className='truncate text-[11px] font-medium text-white/75'>♪ {music.title}</p>
                {music.artistName && (
                  <p className='hidden sm:block shrink-0 text-[10px] text-white/45'>— {music.artistName}</p>
                )}
              </div>
            ) : null}
          </div>

          {/* Volume and Playback control — video or image-with-music */}
          {(mediaType === 'VIDEO' || music?.audioUrl) && onVolumeButtonClick && onVolumeChange ? (
            <div className='group ml-auto flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2 py-1 text-white shadow-xl backdrop-blur-xl transition-all duration-300 hover:bg-black/60'>
              {/* Play/Pause Button (Image + Music only) */}
              {mediaType !== 'VIDEO' && music?.audioUrl && onPlayPauseClick ? (
                <button
                  type='button'
                  onClick={onPlayPauseClick}
                  className='inline-flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-transform duration-300 hover:scale-110 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
                  aria-label={isMusicPaused ? 'Play music' : 'Pause music'}
                  title={isMusicPaused ? 'Play' : 'Pause'}
                >
                  {isMusicPaused ? <Play className='h-4 w-4 fill-current' /> : <Pause className='h-4 w-4' />}
                </button>
              ) : null}

              {/* Volume Button */}
              <button
                type='button'
                onClick={onVolumeButtonClick}
                className='inline-flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-transform duration-300 hover:scale-110 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
                aria-label={storyVolume === 0 ? 'Unmute story' : 'Mute story'}
                title={storyVolume === 0 ? 'Unmute' : 'Mute'}
              >
                {storyVolume === 0 ? <VolumeX className='h-4 w-4' /> : <Volume2 className='h-4 w-4' />}
              </button>
              <input
                type='range'
                min={0}
                max={100}
                step={1}
                value={Math.round(storyVolume * 100)}
                onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                className='pointer-events-none h-1.5 w-0 opacity-0 accent-white transition-all duration-200 group-hover:pointer-events-auto group-hover:w-20 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:w-20 group-focus-within:opacity-100'
                aria-label='Story volume'
              />
            </div>
          ) : (
            (headerTrailing ?? null)
          )}
        </div>
      </div>

      {/* ── Caption ──────────────────────────────────────────────────── */}
      {caption ? (
        <div className='absolute inset-x-0 bottom-20 z-10 p-5'>
          <p className='line-clamp-5 whitespace-pre-line text-sm leading-relaxed text-white drop-shadow-md'>
            {caption}
          </p>
        </div>
      ) : null}

      {/* ── Footer slot ──────────────────────────────────────────────── */}
      {footer && <div className='absolute inset-x-0 bottom-5 z-20 flex items-center justify-center'>{footer}</div>}

      {/* ── Overlay slot (nav arrows, remove button, etc.) ───────────── */}
      {overlay}
    </div>
  )
}
