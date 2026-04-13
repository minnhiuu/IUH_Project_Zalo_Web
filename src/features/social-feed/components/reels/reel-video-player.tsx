import { useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSocialText } from '../../i18n/use-social-text'

interface ReelVideoPlayerProps {
  src: string
  poster?: string
  ariaLabel?: string
  className?: string
  loop?: boolean
  autoPlay?: boolean
  shouldPlay?: boolean
}

export function ReelVideoPlayer({
  src,
  poster,
  ariaLabel,
  className,
  loop = true,
  autoPlay = true,
  shouldPlay = true
}: ReelVideoPlayerProps) {
  const { text } = useSocialText()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progressPercent, setProgressPercent] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasError, setHasError] = useState(false)

  const safeProgress = useMemo(() => Math.max(0, Math.min(100, progressPercent)), [progressPercent])

  const formatTime = (timeInSeconds: number) => {
    if (!Number.isFinite(timeInSeconds)) return '0:00'
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const player = videoRef.current
    if (!player) {
      return
    }

    player.muted = isMuted

    if (!shouldPlay) {
      player.pause()
      return
    }

    if (isPaused) {
      player.pause()
      return
    }

    const playPromise = player.play()
    void playPromise?.catch(() => {})
  }, [isMuted, isPaused, shouldPlay])

  function handleTogglePlay() {
    setIsPaused((previous) => !previous)
  }

  function handleProgressChange(nextProgress: number) {
    const player = videoRef.current
    if (!player || !Number.isFinite(player.duration) || player.duration <= 0) {
      return
    }

    const normalized = Math.max(0, Math.min(100, nextProgress))
    const nextTime = (normalized / 100) * player.duration
    player.currentTime = nextTime
    setProgressPercent(normalized)
  }

  return (
    <div className={cn('group relative h-full w-full overflow-hidden bg-black', className)}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        aria-label={ariaLabel}
        className='h-full w-full object-cover transition-opacity duration-500'
        autoPlay={autoPlay && shouldPlay}
        muted={isMuted}
        loop={loop}
        playsInline
        preload='metadata'
        onTimeUpdate={(event) => {
          const currentDuration = event.currentTarget.duration
          const currentVideoTime = event.currentTarget.currentTime

          if (!Number.isFinite(currentDuration) || currentDuration <= 0) {
            setProgressPercent(0)
            setCurrentTime(0)
            return
          }

          setDuration(currentDuration)
          setCurrentTime(currentVideoTime)
          setProgressPercent((currentVideoTime / currentDuration) * 100)
        }}
        onLoadedMetadata={(event) => {
          if (Number.isFinite(event.currentTarget.duration)) {
            setDuration(event.currentTarget.duration)
          }
        }}
        onError={() => setHasError(true)}
        onClick={handleTogglePlay}
      />

      <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 mix-blend-multiply' />

      {hasError && (
        <div className='absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 text-white backdrop-blur-sm'>
          <AlertCircle className='mb-2 h-10 w-10 text-red-500' />
          <p className='text-sm font-medium'>{text.reels.videoFailed}</p>
        </div>
      )}

      {!hasError && (
        <>
          <button
            type='button'
            onClick={() => setIsMuted((previous) => !previous)}
            className='absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60'
            aria-label={isMuted ? text.reels.unmuteAriaLabel : text.reels.muteAriaLabel}
          >
            {isMuted ? <VolumeX className='h-4 w-4' /> : <Volume2 className='h-4 w-4' />}
          </button>

          <button
            type='button'
            onClick={handleTogglePlay}
            className='absolute inset-0 z-10 flex items-center justify-center'
            aria-label={isPaused ? text.reels.playAriaLabel : text.reels.pauseAriaLabel}
          >
            <span
              className={cn(
                'inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white shadow-sm backdrop-blur-sm transition-all',
                isPaused ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
              )}
            >
              {isPaused ? <Play className='h-6 w-6 fill-current' /> : <Pause className='h-6 w-6' />}
            </span>
          </button>

          {/* Time Display */}
          <div className='absolute bottom-4 left-4 z-20 text-[13px] font-medium text-white drop-shadow-md'>
            {formatTime(currentTime)} <span className='text-white/60'>/</span> {formatTime(duration)}
          </div>

          {/* Progress Indicator */}
          <div className='absolute bottom-0 inset-x-0 z-20 flex h-6 items-end group/progress'>
            <div className='relative w-full h-1 bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover/progress:h-1.5'>
              {/* Buffered/Fill Logic */}
              <div
                className='absolute left-0 top-0 h-full bg-white transition-all duration-75 ease-linear'
                style={{ width: `${safeProgress}%` }}
              >
                {/* Optional handle thumb on hover */}
                <div className='absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 scale-0 rounded-full bg-white opacity-0 shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300 group-hover/progress:scale-100 group-hover/progress:opacity-100' />
              </div>
            </div>

            {/* Invisible Interactive Range Input */}
            <input
              type='range'
              min={0}
              max={100}
              step={0.1}
              value={safeProgress}
              onChange={(event) => handleProgressChange(Number(event.target.value))}
              className='absolute bottom-0 left-0 z-30 h-full w-full cursor-pointer opacity-0'
              aria-label={text.reels.seekAriaLabel}
            />
          </div>
        </>
      )}
    </div>
  )
}
