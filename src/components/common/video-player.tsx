import { useEffect, useMemo, useRef, useState } from 'react'
import videojs from 'video.js'
import { cn } from '@/lib/utils'
import 'video.js/dist/video-js.css'
import './video-player.css'

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
  // Only force explicit MIME for adaptive formats that benefit from explicit typing.
  if (sourceType === 'application/x-mpegURL' || sourceType === 'application/dash+xml') {
    return { src, type: sourceType }
  }

  return { src }
}

interface VideoPlayerProps {
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
  loop?: boolean
  playsInline?: boolean
  preload?: 'auto' | 'metadata' | 'none'
}

export function VideoPlayer({
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
  loop = false,
  playsInline = true,
  preload = 'metadata'
}: VideoPlayerProps) {
  const videoHostRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null)
  const [unsupportedSrc, setUnsupportedSrc] = useState<string | null>(null)
  const shouldAutoplay = autoPlay ?? autoplay
  const sourceType = useMemo(() => inferVideoMimeType(src), [src])
  const hasUnsupportedError = unsupportedSrc === src
  const shouldUseNativePlayer =
    !sourceType ||
    sourceType === 'video/quicktime' ||
    // Preview/thumbnail videos do not benefit from Video.js controls and are cheaper as native video.
    !controls

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

      // Ensure source state is fully applied after creation in async mount scenarios.
      player.src(buildVideoJsSource(src, sourceType))
      player.poster(poster ?? '')
      player.controls(controls)
      player.loop(loop)
      player.muted(muted)
      player.preload(preload)
      player.load()

      if (shouldAutoplay) {
        player.ready(() => {
          const playPromise = player.play()
          void playPromise?.catch(() => {
            // Ignore autoplay rejection (common when browser blocks unmuted autoplay).
          })
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
    }

    rafId = requestAnimationFrame(initPlayer)

    return () => {
      cancelled = true
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }

      // Dispose the player to avoid leaked listeners/nodes when component unmounts.
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
    loop,
    preload,
    poster,
    playsInline,
    ariaLabel,
    unsupportedSrc
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
    playerRef.current.preload(preload)
    playerRef.current.playsinline(playsInline)
    playerRef.current.autoplay(shouldAutoplay)
    playerRef.current.load()

    if (shouldAutoplay) {
      const playPromise = playerRef.current.play()
      void playPromise?.catch(() => {
        // Ignore autoplay rejection (common when browser blocks unmuted autoplay).
      })
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
    loop,
    playsInline,
    preload,
    ariaLabel
  ])

  if (hasUnsupportedError) {
    return (
      <div
        className={cn(
          'bondhub-video-shell h-full w-full flex items-center justify-center bg-black/80 px-4 text-center',
          className
        )}
      >
        <div>
          <p className='text-sm font-semibold text-white'>Unable to play this video</p>
          <p className='mt-1 text-xs text-zinc-300'>This media format is not supported or the source is unavailable.</p>
        </div>
      </div>
    )
  }

  if (shouldUseNativePlayer) {
    return (
      <div className={cn('bondhub-video-shell h-full w-full', `bondhub-video-fit-${objectFit}`, className)}>
        <video
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
          className={cn('h-full w-full', videoClassName, objectFit === 'cover' ? 'object-cover' : 'object-contain')}
        />
      </div>
    )
  }

  return (
    <div className={cn('bondhub-video-shell h-full w-full', `bondhub-video-fit-${objectFit}`, className)}>
      <div ref={videoHostRef} data-vjs-player className={cn('h-full w-full', videoClassName)} />
    </div>
  )
}
