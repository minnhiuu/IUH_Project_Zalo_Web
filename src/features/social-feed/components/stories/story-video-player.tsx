import { useEffect, useMemo, useRef, useState } from 'react'
import videojs from 'video.js'
import { Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import 'video.js/dist/video-js.css'
import './story-video-player.css'

function inferVideoMimeType(url: string): string | undefined {
  const normalizedUrl = url.split('?')[0].toLowerCase()

  if (normalizedUrl.endsWith('.m3u8')) return 'application/x-mpegURL'
  if (normalizedUrl.endsWith('.mpd')) return 'application/dash+xml'
  if (normalizedUrl.endsWith('.webm')) return 'video/webm'
  if (normalizedUrl.endsWith('.ogg') || normalizedUrl.endsWith('.ogv')) return 'video/ogg'
  if (normalizedUrl.endsWith('.mov')) return 'video/quicktime'
  if (normalizedUrl.endsWith('.m4v')) return 'video/x-m4v'
  if (normalizedUrl.endsWith('.mp4')) return 'video/mp4'

  return undefined
}

function buildVideoJsSource(src: string, sourceType?: string): { src: string; type?: string } {
  if (sourceType === 'application/x-mpegURL' || sourceType === 'application/dash+xml') {
    return { src, type: sourceType }
  }

  return { src }
}

interface StoryVideoPlayerProps {
  src: string
  poster?: string
  className?: string
  videoClassName?: string
  ariaLabel?: string
  objectFit?: 'contain' | 'cover'
  controls?: boolean
  autoplay?: boolean
  autoPlay?: boolean
  muted?: boolean
  volume?: number
  loop?: boolean
  playsInline?: boolean
  preload?: 'auto' | 'metadata' | 'none'
  allowTapPlayPause?: boolean
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onEnded?: () => void
}

export function StoryVideoPlayer({
  src,
  poster,
  className,
  videoClassName,
  ariaLabel,
  objectFit = 'contain',
  controls = true,
  autoplay = false,
  autoPlay,
  muted = false,
  volume = 1,
  loop = false,
  playsInline = true,
  preload = 'metadata',
  allowTapPlayPause = false,
  onTimeUpdate,
  onEnded
}: StoryVideoPlayerProps) {
  const videoHostRef = useRef<HTMLDivElement | null>(null)
  const nativeVideoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null)
  const [unsupportedSrc, setUnsupportedSrc] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [prevSrc, setPrevSrc] = useState(src)

  if (src !== prevSrc) {
    setPrevSrc(src)
    setIsPaused(false)
  }

  const shouldAutoplay = autoPlay ?? autoplay
  const normalizedVolume = Math.max(0, Math.min(1, volume))
  const sourceType = useMemo(() => inferVideoMimeType(src), [src])
  const hasUnsupportedError = unsupportedSrc === src
  const shouldUseNativePlayer = !sourceType || sourceType === 'video/quicktime' || !controls

  useEffect(() => {
    if (shouldUseNativePlayer || !videoHostRef.current || playerRef.current) {
      return
    }

    let rafId: number | null = null
    let cancelled = false

    const initPlayer = () => {
      if (cancelled || playerRef.current) {
        return
      }

      const hostElement = videoHostRef.current
      if (!hostElement || !hostElement.isConnected) {
        rafId = requestAnimationFrame(initPlayer)
        return
      }

      const videoElement = document.createElement('video-js')
      videoElement.className = 'video-js vjs-big-play-centered h-full w-full'

      if (ariaLabel) {
        videoElement.setAttribute('aria-label', ariaLabel)
      }

      hostElement.appendChild(videoElement)

      const options: NonNullable<Parameters<typeof videojs>[1]> = {
        fluid: false,
        responsive: true,
        controls,
        autoplay: shouldAutoplay,
        muted,
        loop,
        preload,
        poster,
        sources: [buildVideoJsSource(src, sourceType)]
      }

      const player = videojs(videoElement, options)
      player.playsinline(playsInline)
      playerRef.current = player

      player.src(buildVideoJsSource(src, sourceType))
      player.poster(poster ?? '')
      player.controls(controls)
      player.loop(loop)
      player.muted(muted)
      player.volume(normalizedVolume)
      player.preload(preload)
      player.load()

      if (shouldAutoplay) {
        player.ready(() => {
          const playPromise = player.play()
          void playPromise?.catch(() => {})
        })
      }

      player.on('error', () => {
        const error = player.error()
        if (error?.code === 4) {
          setUnsupportedSrc(src)
        }
      })

      player.on('loadeddata', () => {
        if (unsupportedSrc === src) {
          setUnsupportedSrc(null)
        }
      })

      player.on('timeupdate', () => {
        if (onTimeUpdate) {
          onTimeUpdate(player.currentTime() ?? 0, player.duration() ?? 0)
        }
      })

      player.on('ended', () => {
        if (onEnded) {
          onEnded()
        }
      })
    }

    rafId = requestAnimationFrame(initPlayer)

    return () => {
      cancelled = true
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }

      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [
    shouldUseNativePlayer,
    src,
    sourceType,
    controls,
    shouldAutoplay,
    muted,
    normalizedVolume,
    loop,
    preload,
    poster,
    playsInline,
    ariaLabel,
    unsupportedSrc,
    onTimeUpdate,
    onEnded
  ])

  useEffect(() => {
    if (shouldUseNativePlayer || !playerRef.current) {
      return
    }

    playerRef.current.src(buildVideoJsSource(src, sourceType))
    playerRef.current.poster(poster ?? '')
    playerRef.current.controls(controls)
    playerRef.current.loop(loop)
    playerRef.current.muted(muted)
    playerRef.current.volume(normalizedVolume)
    playerRef.current.preload(preload)
    playerRef.current.playsinline(playsInline)
    playerRef.current.autoplay(shouldAutoplay)
    playerRef.current.load()

    if (shouldAutoplay) {
      const playPromise = playerRef.current.play()
      void playPromise?.catch(() => {})
    }

    if (ariaLabel) {
      playerRef.current.el()?.setAttribute('aria-label', ariaLabel)
    }
  }, [
    shouldUseNativePlayer,
    src,
    sourceType,
    poster,
    controls,
    shouldAutoplay,
    muted,
    normalizedVolume,
    loop,
    playsInline,
    preload,
    ariaLabel
  ])

  useEffect(() => {
    if (!shouldUseNativePlayer || !nativeVideoRef.current) {
      return
    }

    nativeVideoRef.current.volume = normalizedVolume
    nativeVideoRef.current.muted = muted
  }, [shouldUseNativePlayer, normalizedVolume, muted])

  useEffect(() => {
    if (!allowTapPlayPause) {
      return
    }

    if (shouldUseNativePlayer) {
      const nativePlayer = nativeVideoRef.current
      if (!nativePlayer) {
        return
      }

      if (isPaused) {
        nativePlayer.pause()
      } else {
        const playPromise = nativePlayer.play()
        void playPromise?.catch(() => {})
      }
      return
    }

    if (!playerRef.current) {
      return
    }

    if (isPaused) {
      playerRef.current.pause()
    } else {
      const playPromise = playerRef.current.play()
      void playPromise?.catch(() => {})
    }
  }, [allowTapPlayPause, shouldUseNativePlayer, isPaused])

  function handlePlayerClick() {
    if (!allowTapPlayPause) {
      return
    }

    setIsPaused((previous) => !previous)
  }

  if (hasUnsupportedError) {
    return (
      <div
        className={cn(
          'story-video-shell h-full w-full flex items-center justify-center bg-zinc-900/80 px-4 text-center text-white dark:bg-black/70',
          className
        )}
      >
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.08em] text-sky-200 dark:text-sky-300'>
            Story unavailable
          </p>
          <p className='mt-2 text-sm text-zinc-200 dark:text-zinc-300'>This story video cannot be played right now.</p>
        </div>
      </div>
    )
  }

  if (shouldUseNativePlayer) {
    return (
      <div
        className={cn(
          'story-video-shell group h-full w-full',
          `story-video-fit-${objectFit}`,
          allowTapPlayPause ? 'cursor-pointer' : '',
          className
        )}
        onClick={handlePlayerClick}
      >
        <video
          ref={nativeVideoRef}
          src={src}
          poster={poster}
          aria-label={ariaLabel}
          controls={controls}
          autoPlay={shouldAutoplay}
          muted={muted}
          loop={loop}
          playsInline={playsInline}
          preload={preload}
          onLoadedData={() => {
            if (unsupportedSrc === src) {
              setUnsupportedSrc(null)
            }
          }}
          onError={(event) => {
            const mediaErrorCode = event.currentTarget.error?.code
            if (mediaErrorCode === 4) {
               setUnsupportedSrc(src)
            }
          }}
          onTimeUpdate={(event) => {
            if (onTimeUpdate) {
              onTimeUpdate(event.currentTarget.currentTime, event.currentTarget.duration)
            }
          }}
          onEnded={() => {
            if (onEnded) onEnded()
          }}
          className={cn('h-full w-full', videoClassName, objectFit === 'cover' ? 'object-cover' : 'object-contain')}
        />

        {allowTapPlayPause ? (
          <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200/80 bg-white/85 text-zinc-700 shadow-sm backdrop-blur-md dark:border-white/35 dark:bg-black/45 dark:text-white'>
              {isPaused ? <Play className='h-5 w-5 fill-current' /> : <Pause className='h-5 w-5' />}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'story-video-shell group h-full w-full relative',
        `story-video-fit-${objectFit}`,
        allowTapPlayPause ? 'cursor-pointer' : '',
        className
      )}
      onClick={handlePlayerClick}
    >
      <div ref={videoHostRef} data-vjs-player className={cn('h-full w-full', videoClassName)} />

      {allowTapPlayPause ? (
        <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200/80 bg-white/85 text-zinc-700 shadow-sm backdrop-blur-md dark:border-white/35 dark:bg-black/45 dark:text-white'>
            {isPaused ? <Play className='h-5 w-5 fill-current' /> : <Pause className='h-5 w-5' />}
          </div>
        </div>
      ) : null}
    </div>
  )
}
