import { ImageIcon, Video, Loader2 } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useSocialText } from '../../../i18n/use-social-text'
import { VisibilityDropdown, type VisibilityType } from '../../composer/visibility-dropdown'
import { MusicPicker } from './music-picker'
import type { TrackDisplay } from '../types'

// ─── Section Label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className='text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70'>
      {children}
    </p>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StoryControlPanelProps {
  // Profile
  profileName: string
  profileAvatar: string

  // Visibility
  visibility: VisibilityType
  onVisibilityChange: (v: VisibilityType) => void

  // Media
  mediaType: 'IMAGE' | 'VIDEO' | null
  onPickImage: () => void
  onPickVideo: () => void
  isImage: boolean

  // Caption
  caption: string
  onCaptionChange: (v: string) => void

  // Music
  showMusicPicker: boolean
  onToggleMusicPicker: () => void
  selectedTrack: TrackDisplay | null
  selectedTrackId: string | null
  playingTrackId: string | null
  genreFilter: string
  onGenreChange: (g: string) => void
  isMusicMuted: boolean
  onToggleMute: () => void
  tracks: TrackDisplay[]
  isLoadingTracks: boolean
  isTracksError: boolean
  onSelectTrack: (id: string) => void
  onTogglePlay: (id: string, audioUrl: string) => void

  // Submit
  canPost: boolean
  isPending: boolean
  onPost: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StoryControlPanel({
  profileName,
  profileAvatar,
  visibility,
  onVisibilityChange,
  mediaType,
  onPickImage,
  onPickVideo,
  isImage,
  caption,
  onCaptionChange,
  showMusicPicker,
  onToggleMusicPicker,
  selectedTrack,
  selectedTrackId,
  playingTrackId,
  genreFilter,
  onGenreChange,
  isMusicMuted,
  onToggleMute,
  tracks,
  isLoadingTracks,
  isTracksError,
  onSelectTrack,
  onTogglePlay,
  canPost,
  isPending,
  onPost
}: StoryControlPanelProps) {
  const { text } = useSocialText()

  return (
    <div className='flex w-[340px] shrink-0 flex-col border-l border-border bg-card lg:w-[372px]'>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className='flex items-center gap-3 border-b border-border px-5 py-4'>
        <div className='rounded-full border-2 border-indigo-500/50 p-[2px] shadow-sm shadow-indigo-500/20'>
          <UserAvatar
            name={profileName}
            src={profileAvatar}
            className='h-8 w-8'
            fallbackClassName='bg-indigo-500/20 text-indigo-300 text-xs font-semibold'
          />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-[13.5px] font-bold text-foreground truncate'>{profileName}</p>
          <p className='text-[11px] text-muted-foreground'>{text.storyComposer.title}</p>
        </div>
        <VisibilityDropdown value={visibility} onChange={onVisibilityChange} align='end' />
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <div className='flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>

        {/* Media type buttons */}
        <div className='space-y-2.5'>
          <SectionLabel>{text.storyComposer.mediaLabel}</SectionLabel>
          <div className='grid grid-cols-2 gap-2'>
            <button
              type='button'
              onClick={onPickImage}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-4 text-[12.5px] font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                mediaType === 'IMAGE'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 shadow-sm shadow-emerald-500/10'
                  : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <ImageIcon className={cn('h-5 w-5', mediaType === 'IMAGE' ? 'text-emerald-500' : 'text-muted-foreground')} />
              {text.storyComposer.addImage}
            </button>
            <button
              type='button'
              onClick={onPickVideo}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-4 text-[12.5px] font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                mediaType === 'VIDEO'
                  ? 'border-rose-500/40 bg-rose-500/10 text-rose-500 shadow-sm shadow-rose-500/10'
                  : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Video className={cn('h-5 w-5', mediaType === 'VIDEO' ? 'text-rose-500' : 'text-muted-foreground')} />
              {text.storyComposer.addVideo}
            </button>
          </div>
        </div>

        {/* Caption */}
        <div className='space-y-2.5'>
          <SectionLabel>{text.storyComposer.captionLabel}</SectionLabel>
          <div className='rounded-2xl border border-border bg-muted/30 transition-all duration-200 focus-within:border-indigo-500/50 focus-within:bg-indigo-500/[0.04] focus-within:shadow-sm focus-within:shadow-indigo-500/10'>
            <Textarea
              value={caption}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder={text.storyComposer.captionPlaceholder}
              className='min-h-[88px] resize-none border-none bg-transparent px-4 pt-3.5 pb-1 text-[13.5px] font-medium leading-relaxed text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0'
              maxLength={200}
            />
            <div className='flex justify-end px-4 pb-3'>
              <span className={cn('text-[11px] tabular-nums transition-colors', caption.length > 160 ? 'text-amber-500' : 'text-muted-foreground/50')}>
                {caption.length}<span className='text-muted-foreground/40'>/200</span>
              </span>
            </div>
          </div>
        </div>

        {/* Background music — images only */}
        {isImage && (
          <div className='space-y-2.5'>
            <SectionLabel>{text.storyComposer.addMusic}</SectionLabel>
            <MusicPicker
              showMusicPicker={showMusicPicker}
              onToggle={onToggleMusicPicker}
              selectedTrack={selectedTrack}
              selectedTrackId={selectedTrackId}
              playingTrackId={playingTrackId}
              genreFilter={genreFilter}
              onGenreChange={onGenreChange}
              isMusicMuted={isMusicMuted}
              onToggleMute={onToggleMute}
              tracks={tracks}
              isLoading={isLoadingTracks}
              isError={isTracksError}
              onSelectTrack={onSelectTrack}
              onTogglePlay={onTogglePlay}
            />
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className='border-t border-border px-5 py-4 space-y-2.5'>
        <Button
          onClick={onPost}
          disabled={!canPost || isPending}
          className={cn(
            'relative h-12 w-full overflow-hidden rounded-2xl text-[14.5px] font-bold text-white shadow-lg transition-all duration-200',
            'bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500',
            'hover:from-indigo-400 hover:via-violet-400 hover:to-purple-400',
            'shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:shadow-xl',
            'hover:scale-[1.015] active:scale-[0.985]',
            'disabled:opacity-35 disabled:pointer-events-none disabled:shadow-none'
          )}
        >
          {canPost && !isPending && (
            <span className='pointer-events-none absolute inset-0 -skew-x-12 translate-x-[-120%] animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent' />
          )}
          {isPending ? <Loader2 className='h-5 w-5 animate-spin' /> : text.storyComposer.share}
        </Button>
        <p className='text-center text-[11.5px] text-muted-foreground/60'>{text.storyComposer.expiresHint}</p>
      </div>
    </div>
  )
}
