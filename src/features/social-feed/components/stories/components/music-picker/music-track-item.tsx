import { Music, Check, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TrackDisplay } from '../../types'

interface MusicTrackItemProps {
  track: TrackDisplay
  isSelected: boolean
  isPlaying: boolean
  onSelect: () => void
  onTogglePlay: () => void
}

/** Animated equaliser bars shown while a track is playing */
function WaveformBars() {
  return (
    <span className='flex items-end gap-[2px] h-4 w-4' aria-hidden>
      <span className='w-[3px] rounded-full bg-white animate-bounce [animation-duration:0.6s] [animation-delay:0s]' style={{ height: '60%' }} />
      <span className='w-[3px] rounded-full bg-white animate-bounce [animation-duration:0.6s] [animation-delay:0.15s]' style={{ height: '100%' }} />
      <span className='w-[3px] rounded-full bg-white animate-bounce [animation-duration:0.6s] [animation-delay:0.3s]' style={{ height: '70%' }} />
    </span>
  )
}

export function MusicTrackItem({ track, isSelected, isPlaying, onSelect, onTogglePlay }: MusicTrackItemProps) {
  const isActivelyPlaying = isPlaying && isSelected

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={cn(
        'group flex items-center gap-3 rounded-xl border p-2.5 transition-all duration-200 cursor-pointer',
        isSelected
          ? 'border-primary/40 bg-primary/[0.08] shadow-sm shadow-primary/10'
          : 'border-border bg-muted/40 hover:bg-muted/70 hover:border-border/80'
      )}
    >
      {/* Cover art — real thumbnail when available, gradient fallback otherwise */}
      <div
        className='relative h-10 w-10 shrink-0 rounded-xl flex items-center justify-center shadow-lg overflow-hidden'
        style={!track.coverUrl ? { background: `linear-gradient(135deg, ${track.coverColor}ee, ${track.coverColor}88)` } : undefined}
      >
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            className='h-full w-full object-cover'
          />
        ) : null}

        {/* Overlay tint when playing to keep waveform visible */}
        {isActivelyPlaying && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/40'>
            <WaveformBars />
          </div>
        )}

        {/* Music icon fallback (no cover, not playing) */}
        {!track.coverUrl && !isActivelyPlaying && (
          <Music className='h-4 w-4 text-white drop-shadow' />
        )}

        {isSelected && (
          <div className='absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary shadow ring-2 ring-card'>
            <Check className='h-2.5 w-2.5 text-white' />
          </div>
        )}
      </div>

      {/* Info */}
      <div className='min-w-0 flex-1'>
        <p className={cn('truncate text-[13px] font-semibold leading-tight', isSelected ? 'text-foreground' : 'text-foreground/90')}>
          {track.title}
        </p>
        <div className='flex items-center gap-1.5 mt-0.5'>
          <p className='truncate text-[11.5px] text-muted-foreground'>
            {track.artist}{track.genre ? ` · ${track.genre}` : ''}
          </p>
          {track.albumName && (
            <span className='shrink-0 rounded-full border border-border/60 bg-muted/60 px-1.5 py-px text-[9.5px] font-semibold uppercase tracking-wide text-muted-foreground/70'>
              {track.albumName}
            </span>
          )}
        </div>
        {track.duration && (
          <p className='mt-px text-[10.5px] text-muted-foreground/50'>
            {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
          </p>
        )}
      </div>

      {/* Play / pause */}
      <button
        type='button'
        onClick={(e) => { e.stopPropagation(); onTogglePlay() }}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-200',
          'hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
          isActivelyPlaying
            ? 'border-primary/60 bg-gradient-to-br from-primary to-primary text-white shadow-md shadow-primary/30'
            : 'border-border bg-muted/60 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10'
        )}
        aria-label={isActivelyPlaying ? 'Pause preview' : 'Play preview'}
      >
        {isActivelyPlaying
          ? <Pause className='h-3.5 w-3.5' />
          : <Play className='h-3.5 w-3.5 translate-x-[1px]' />}
      </button>
    </div>
  )
}
