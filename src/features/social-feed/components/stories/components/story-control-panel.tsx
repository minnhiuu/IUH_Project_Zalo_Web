import { useState } from 'react'
import { X, Music, Type, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useSocialText } from '../../../i18n/use-social-text'
import { VisibilityDropdown, type VisibilityType } from '../../composer/visibility-dropdown'
import { MusicPicker } from './music-picker'
import type { TrackDisplay } from '../types'

interface StoryControlPanelProps {
  profileName: string
  profileAvatar: string
  visibility: VisibilityType
  onVisibilityChange: (v: VisibilityType) => void
  mediaType: 'IMAGE' | 'VIDEO' | null
  caption: string
  onCaptionChange: (v: string) => void
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
  onPost: () => void
  onClose: () => void
  isPending: boolean
  canPost: boolean
}

export function StoryControlPanel({
  profileName,
  profileAvatar,
  visibility,
  onVisibilityChange,
  mediaType,
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
  onPost,
  onClose,
  isPending,
  canPost
}: StoryControlPanelProps) {
  const { text } = useSocialText()

  // Independent expansion states
  const [isTextExpanded, setIsTextExpanded] = useState(false)

  return (
    <div className='flex h-full w-[340px] shrink-0 flex-col border-r border-zinc-200 bg-white lg:w-[360px] dark:border-white/10 dark:bg-zinc-950 shadow-xl z-10'>
      {/* ── Top Header ── */}
      <div className='flex items-center gap-2 p-4 pb-2'>
        <button
          onClick={onClose}
          className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-secondary-hover'
        >
          <X className='h-6 w-6' />
        </button>
        <div className='flex h-10 w-10 items-center justify-center'>
          <img src='/images/logo.svg' alt='Logo' className='h-8 w-8' />
        </div>
      </div>

      {/* ── Title & Profile ── */}
      <div className='px-4 py-3 space-y-3'>
        <div className='flex items-center justify-between'>
          <h1 className='text-[24px] font-bold text-zinc-900 dark:text-white tracking-tight'>{text.stories.create}</h1>
        </div>

        <div className='flex items-center gap-3 px-2 py-1 rounded-lg transition-colors'>
          <UserAvatar
            name={profileName}
            src={profileAvatar}
            className='h-12 w-12 border-2 border-white shadow-sm dark:border-zinc-800'
          />
          <div className='flex-1 min-w-0 flex items-center justify-between gap-2'>
            <p className='text-[16px] font-bold text-zinc-900 dark:text-white truncate'>{profileName}</p>
            <VisibilityDropdown value={visibility} onChange={onVisibilityChange} align='end' />
          </div>
        </div>
      </div>

      <div className='h-[1px] bg-zinc-100 dark:bg-white/5 mx-4' />

      {/* ── Controls List ── */}
      <div className='flex-1 overflow-y-auto px-2 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        {!mediaType ? (
          <div className='px-2 mt-4'>
            <p className='text-[14px] font-medium text-zinc-400'>{text.storyComposer.pickMediaSubtitle}</p>
          </div>
        ) : (
          <div className='space-y-1'>
            {/* Text Section */}
            <div className='space-y-1'>
              <button
                onClick={() => setIsTextExpanded(!isTextExpanded)}
                className='flex w-full items-center justify-between rounded-xl p-3 transition-all hover:bg-zinc-100 active:scale-[0.98] dark:hover:bg-white/5 group'
              >
                <div className='flex items-center gap-4'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition-colors group-hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:group-hover:bg-zinc-700'>
                    <Type className='h-5 w-5' />
                  </div>
                  <span className='text-[16px] font-bold text-zinc-900 dark:text-white'>
                    {text.storyComposer.addText}
                  </span>
                </div>
                {isTextExpanded ? (
                  <ChevronUp className='h-5 w-5 text-zinc-400' />
                ) : (
                  <ChevronDown className='h-5 w-5 text-zinc-400' />
                )}
              </button>

              {isTextExpanded && (
                <div className='px-3 pb-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300'>
                  <div className='rounded-xl border border-zinc-200 bg-zinc-50/30 transition-all duration-200 focus-within:border-primary focus-within:bg-white dark:border-white/10 dark:bg-zinc-900/30 dark:focus-within:bg-zinc-900'>
                    <Textarea
                      autoFocus
                      value={caption}
                      onChange={(e) => onCaptionChange(e.target.value)}
                      placeholder={text.storyComposer.captionPlaceholder}
                      className='min-h-[80px] resize-none border-none bg-transparent px-4 py-3 text-[15px] font-medium leading-relaxed text-zinc-900 dark:text-white shadow-none placeholder:text-zinc-400 focus-visible:ring-0'
                      maxLength={200}
                    />
                    <div className='flex justify-end px-4 pb-2'>
                      <span className='text-[11px] font-bold text-zinc-400'>{caption.length}/200</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Music Section */}
            <div className='space-y-1'>
              <button
                onClick={() => onToggleMusicPicker()}
                className='flex w-full items-center justify-between rounded-xl p-3 transition-all hover:bg-zinc-100 active:scale-[0.98] dark:hover:bg-white/5 group'
              >
                <div className='flex items-center gap-4'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition-colors group-hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:group-hover:bg-zinc-700'>
                    <Music className='h-5 w-5' />
                  </div>
                  <span className='text-[16px] font-bold text-zinc-900 dark:text-white'>
                    {text.storyComposer.addMusic}
                  </span>
                </div>
                {showMusicPicker ? (
                  <ChevronUp className='h-5 w-5 text-zinc-400' />
                ) : (
                  <ChevronDown className='h-5 w-5 text-zinc-400' />
                )}
              </button>

              {showMusicPicker && (
                <div className='px-3 pb-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300'>
                  <MusicPicker
                    showMusicPicker={true}
                    onToggle={() => {}}
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
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      {mediaType && (
        <div className='p-4 border-t border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-950 space-y-3'>
          <div className='flex gap-2'>
            <Button
              variant='secondary'
              onClick={onClose}
              className='flex-1 h-10 rounded-lg bg-zinc-100 text-[15px] font-bold text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 shadow-none border-none'
            >
              {text.storyComposer.discard}
            </Button>
            <Button
              onClick={onPost}
              disabled={!canPost || isPending}
              className={cn(
                'flex-[2] h-10 rounded-lg text-[15px] font-bold text-white shadow-sm transition-all',
                'bg-[#0068ff] hover:bg-[#005ae0]',
                'disabled:opacity-50 disabled:bg-zinc-200 disabled:text-zinc-500'
              )}
            >
              {isPending ? <Loader2 className='h-5 w-5 animate-spin' /> : text.storyComposer.share}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
