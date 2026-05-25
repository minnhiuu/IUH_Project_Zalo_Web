import { useState } from 'react'
import { Music, ChevronDown, Volume2, VolumeX, AlertCircle, Search, X, Disc3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSocialText } from '../../../../i18n/use-social-text'
import { MUSIC_GENRES } from '../../constants'
import { MusicTrackItem } from './music-track-item'
import type { TrackDisplay } from '../../types'
import type { SocialStory } from '../../stories-strip'

interface MusicPickerProps {
  showMusicPicker: boolean
  onToggle: () => void
  selectedTrack: TrackDisplay | null
  selectedTrackId: string | null
  playingTrackId: string | null
  genreFilter: string
  onGenreChange: (genre: string) => void
  isMusicMuted: boolean
  onToggleMute: () => void
  tracks: TrackDisplay[]
  isLoading: boolean
  isError: boolean
  onSelectTrack: (id: string) => void
  onTogglePlay: (id: string, audioUrl: string) => void
  /** PostMusic from backend — shown when editing a story that already has a saved track */
  existingMusic?: SocialStory['music'] | null
}

export function MusicPicker({
  showMusicPicker,
  onToggle,
  selectedTrack,
  selectedTrackId,
  playingTrackId,
  genreFilter,
  onGenreChange,
  isMusicMuted,
  onToggleMute,
  tracks,
  isLoading,
  isError,
  onSelectTrack,
  onTogglePlay,
  existingMusic
}: MusicPickerProps) {
  const { text } = useSocialText()
  const [searchQuery, setSearchQuery] = useState('')

  const handleGenreChange = (genre: string) => {
    setSearchQuery('')
    onGenreChange(genre)
  }

  const filteredTracks = searchQuery.trim()
    ? tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tracks

  return (
    <div className='space-y-2.5'>
      {/* ── Toggle button ─────────────────────────────────────────────── */}
      <button
        type='button'
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200',
          showMusicPicker
            ? 'border-primary/40 bg-primary/10 shadow-sm shadow-primary/10'
            : 'border-border bg-muted/40 hover:bg-muted/70 hover:border-border/80'
        )}
      >
        {/* Icon badge */}
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
            showMusicPicker
              ? 'bg-gradient-to-br from-primary to-primary text-white shadow-md shadow-primary/30'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Music className='h-4 w-4' />
        </div>

        {/* Label */}
        <div className='min-w-0 flex-1 text-left'>
          <p
            className={cn(
              'text-[13px] font-semibold leading-tight',
              selectedTrack ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {selectedTrack ? selectedTrack.title : text.storyComposer.addMusic}
          </p>
          <p className='truncate text-[11.5px] text-muted-foreground mt-0.5'>
            {selectedTrack
              ? `${selectedTrack.artist} · ${selectedTrack.genre}`
              : text.storyComposer.addMusicHint}
          </p>
        </div>

        {/* Playing dot */}
        {selectedTrack && (
          <span className='relative flex h-2 w-2 shrink-0'>
            <span
              className='animate-ping absolute inline-flex h-full w-full rounded-full opacity-60'
              style={{ background: selectedTrack.coverColor }}
            />
            <span
              className='relative inline-flex h-2 w-2 rounded-full'
              style={{ background: selectedTrack.coverColor }}
            />
          </span>
        )}

        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-300',
            showMusicPicker && 'rotate-180'
          )}
        />
      </button>

      {/* ── Picker panel ──────────────────────────────────────────────── */}
      {showMusicPicker && (
        <div className='overflow-hidden rounded-2xl border border-border bg-card shadow-xl'>

          {/* Search bar */}
          <div className='px-3 pt-3'>
            <div className='flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 transition-all duration-200 focus-within:border-primary/50 focus-within:bg-primary/[0.04] focus-within:shadow-sm focus-within:shadow-primary/10'>
              <Search className='h-3.5 w-3.5 shrink-0 text-muted-foreground/60' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={text.storyComposer.musicSearchPlaceholder}
                className='flex-1 bg-transparent text-[12.5px] font-medium text-foreground placeholder:text-muted-foreground/60 outline-none'
              />
              {searchQuery && (
                <button
                  type='button'
                  onClick={() => setSearchQuery('')}
                  className='flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30 transition-colors'
                  aria-label='Clear search'
                >
                  <X className='h-2.5 w-2.5' />
                </button>
              )}
            </div>
          </div>

          {/* ── Saved PostMusic banner – shown when story already has a track ── */}
          {existingMusic?.title && !selectedTrackId && (
            <div className='mx-3 mt-3 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/[0.08] p-2.5'>
              {/* Album art */}
              <div className='relative h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary/60 to-primary/60 shadow flex items-center justify-center'>
                {existingMusic.coverUrl ? (
                  <img src={existingMusic.coverUrl} alt={existingMusic.title ?? ''} className='h-full w-full object-cover' />
                ) : (
                  <Disc3 className='h-4 w-4 text-white/80' />
                )}
              </div>
              {/* Info */}
              <div className='min-w-0 flex-1'>
                <p className='truncate text-[12.5px] font-semibold text-primary/20 leading-tight'>
                  ♪ {existingMusic.title}
                </p>
                {existingMusic.artistName && (
                  <p className='truncate text-[11px] text-primary/30/70 mt-0.5'>{existingMusic.artistName}</p>
                )}
                {existingMusic.duration && (
                  <p className='text-[10px] text-primary/50 mt-0.5'>
                    {Math.floor(existingMusic.duration / 60)}:{String(existingMusic.duration % 60).padStart(2, '0')}
                  </p>
                )}
              </div>
              {/* Saved label */}
              <span className='shrink-0 rounded-full border border-primary/40 bg-primary/20 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-primary/30'>
                saved
              </span>
            </div>
          )}

          {/* Genre filter pills */}
          <div className='relative'>
            <div className='flex gap-1.5 overflow-x-auto touch-pan-x px-3 pt-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              {MUSIC_GENRES.map((genre) => (
                <button
                  key={genre}
                  type='button'
                  onClick={() => handleGenreChange(genre)}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1 text-[11.5px] font-semibold transition-all duration-150',
                    genreFilter === genre
                      ? 'border-primary/70 bg-gradient-to-r from-primary to-primary text-white shadow-sm shadow-primary/30 ring-1 ring-primary/20'
                      : 'border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border/80'
                  )}
                >
                  {genre}
                </button>
              ))}
              {/* Trailing spacer so the last pill isn't flush against the edge */}
              <span className='shrink-0 w-2' aria-hidden />
            </div>
            {/* Right-edge fade to signal there's more to scroll */}
            <div className='pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent' />
          </div>

          {/* Divider */}
          <div className='mx-3 border-t border-border/60' />

          {/* Now playing bar */}
          {playingTrackId && (
            <div className='mx-3 mt-2.5 flex items-center gap-2.5 rounded-xl border border-primary/25 bg-primary/[0.08] px-3 py-2'>
              <span className='relative flex h-2 w-2 shrink-0'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-primary' />
              </span>
              <p className='flex-1 text-[11.5px] font-medium text-primary/30'>{text.storyComposer.nowPlaying}</p>
              <button
                type='button'
                onClick={onToggleMute}
                className='flex h-6 w-6 items-center justify-center rounded-lg text-primary hover:text-white transition-colors hover:bg-primary/20'
                aria-label={isMusicMuted ? 'Unmute' : 'Mute'}
              >
                {isMusicMuted ? <VolumeX className='h-3.5 w-3.5' /> : <Volume2 className='h-3.5 w-3.5' />}
              </button>
            </div>
          )}

          {/* Track list */}
          <div className='flex flex-col gap-1.5 p-3 max-h-[256px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-2.5 animate-pulse'>
                  <div className='h-10 w-10 shrink-0 rounded-xl bg-muted' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-3 w-3/4 rounded bg-muted' />
                    <div className='h-2.5 w-1/2 rounded bg-muted' />
                  </div>
                  <div className='h-8 w-8 shrink-0 rounded-full bg-muted' />
                </div>
              ))
            ) : isError ? (
              <div className='flex flex-col items-center gap-2 py-8 text-center'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                  <AlertCircle className='h-5 w-5 text-muted-foreground/50' />
                </div>
                <p className='text-[12px] text-muted-foreground'>{text.storyComposer.musicLoadError}</p>
              </div>
            ) : filteredTracks.length === 0 ? (
              <div className='flex flex-col items-center gap-2 py-8 text-center'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                  <Search className='h-4.5 w-4.5 text-muted-foreground/40' />
                </div>
                <p className='text-[12px] text-muted-foreground'>
                  {searchQuery ? text.storyComposer.musicNoResults : 'No tracks found'}
                </p>
              </div>
            ) : (
              filteredTracks.map((track) => (
                <MusicTrackItem
                  key={track.id}
                  track={track}
                  isSelected={selectedTrackId === track.id}
                  isPlaying={playingTrackId === track.id}
                  onSelect={() => onSelectTrack(track.id)}
                  onTogglePlay={() => onTogglePlay(track.id, track.audio)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
