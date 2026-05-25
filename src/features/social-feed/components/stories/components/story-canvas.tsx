import { useState, useEffect } from 'react'
import { ImageIcon, Video, X, RotateCcw, Plus, Minus } from 'lucide-react'
import { useSocialText } from '../../../i18n/use-social-text'
import type { TrackDisplay } from '../types'

interface StoryCanvasProps {
  mediaPreviewUrl: string | null
  mediaType: 'IMAGE' | 'VIDEO' | null
  profileName: string
  profileAvatar: string
  caption: string
  selectedTrack: TrackDisplay | null
  onClearMedia: () => void
  onPickImage: () => void
  onPickVideo: () => void
  isPending?: boolean
}

export function StoryCanvas({
  mediaPreviewUrl,
  mediaType,
  caption,
  onClearMedia,
  onPickImage,
  onPickVideo,
  isPending = false
}: StoryCanvasProps) {
  const { text } = useSocialText()
  const isImage = mediaType === 'IMAGE'

  // Edit State
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  // Reset state when media changes
  useEffect(() => {
    if (!mediaPreviewUrl) {
      setZoom(1)
      setRotation(0)
    }
  }, [mediaPreviewUrl])

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  return (
    <div className='relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#f0f2f5] dark:bg-[#18191a]'>
      {!mediaPreviewUrl ? (
        /* Empty State */
        <div className='flex h-full w-full animate-in fade-in zoom-in-95 duration-500 items-center justify-center gap-4 p-6 sm:gap-6'>
          <button
            type='button'
            onClick={onPickImage}
            className='group relative flex h-[330px] w-[220px] flex-col items-center justify-center gap-4 overflow-hidden rounded-xl bg-gradient-to-b from-blue-600 to-sky-400 p-6 text-white transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-95 shadow-lg'
          >
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 shadow-md transition-transform group-hover:scale-110'>
              <ImageIcon className='h-6 w-6' />
            </div>
            <span className='text-center text-[15px] font-bold leading-snug'>
              {text.storyComposer.photoStory.split(' ').slice(0, 2).join(' ')}
              <br />
              {text.storyComposer.photoStory.split(' ').slice(2).join(' ')}
            </span>
            <div className='absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5' />
          </button>

          <button
            type='button'
            onClick={onPickVideo}
            className='group relative flex h-[330px] w-[220px] flex-col items-center justify-center gap-4 overflow-hidden rounded-xl bg-gradient-to-b from-rose-600 to-orange-500 p-6 text-white transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-95 shadow-lg'
          >
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-white text-rose-600 shadow-md transition-transform group-hover:scale-110'>
              <Video className='h-6 w-6' />
            </div>
            <span className='text-center text-[15px] font-bold leading-snug'>
              {text.storyComposer.videoStory.split(' ').slice(0, 2).join(' ')}
              <br />
              {text.storyComposer.videoStory.split(' ').slice(2).join(' ')}
            </span>
            <div className='absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5' />
          </button>
        </div>
      ) : (
        /* Preview State */
        <div className='flex h-full w-full flex-col items-center justify-center p-1 sm:p-2 lg:p-3'>
          {/* Main White Container - MAXIMISED */}
          <div className='flex h-[96%] w-full max-w-[1400px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900'>
            {/* Header: "Preview" */}
            <div className='flex items-center justify-between border-b border-zinc-100 px-6 py-3 dark:border-white/5'>
              <p className='text-[14px] font-bold text-zinc-900 dark:text-white'>{text.storyComposer.preview}</p>
              {!isPending && (
                <button onClick={onClearMedia} className='text-zinc-400 hover:text-zinc-600 transition-colors'>
                  <X className='h-5 w-5' />
                </button>
              )}
            </div>

            {/* Body area - Minimised padding for massive preview */}
            <div className='flex-1 bg-[#f0f2f5] p-1 sm:p-2 dark:bg-zinc-950 flex flex-col min-h-0'>
              {/* Dark container for raw media preview */}
              <div className='relative flex-1 w-full flex flex-col items-center justify-center overflow-hidden rounded-xl bg-[#1c1e21] shadow-xl ring-1 ring-black/5'>
                {/* Media Content - Truly Massive Frame */}
                <div className='relative flex-1 w-full flex items-center justify-center p-1 sm:p-2'>
                  <div className='relative h-full w-auto aspect-[9/16] overflow-hidden rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.4)] bg-[#242526]'>
                    <div className='absolute inset-0 flex flex-col'>
                      {/* Dynamic Background */}
                      <div className='absolute inset-0 overflow-hidden'>
                        <img
                          src={mediaPreviewUrl}
                          alt=''
                          className='h-full w-full object-cover blur-[60px] opacity-60 scale-150 brightness-75 transition-all'
                          style={{ transform: `scale(${zoom * 1.5}) rotate(${rotation}deg)` }}
                        />
                        <div className='absolute inset-0 bg-black/30' />
                      </div>

                      {/* Main Media */}
                      <div className='relative flex-1 flex items-center justify-center overflow-hidden z-10'>
                        <div
                          className='transition-transform duration-300 ease-out h-full w-full flex items-center justify-center'
                          style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
                        >
                          {isImage ? (
                            <img
                              src={mediaPreviewUrl}
                              alt='Preview'
                              className='w-full h-auto max-h-full object-contain select-none shadow-2xl'
                            />
                          ) : (
                            <video
                              src={mediaPreviewUrl}
                              className='w-full h-auto max-h-full object-contain shadow-2xl'
                              controls={false}
                              autoPlay
                              loop
                              muted
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {caption && (
                      <div className='absolute inset-x-0 bottom-10 flex justify-center px-4 z-20'>
                        <p className='rounded-lg bg-black/40 px-3 py-1.5 text-center text-[15px] font-bold text-white backdrop-blur-sm'>
                          {caption}
                        </p>
                      </div>
                    )}
                  </div>

                  {isPending && (
                    <div className='absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black/60 backdrop-blur-md'>
                      <div className='relative flex h-16 w-16 items-center justify-center'>
                        <div className='absolute inset-0 rounded-full border-4 border-white/20' />
                        <div className='absolute inset-0 animate-spin rounded-full border-4 border-white border-t-transparent' />
                      </div>
                      <p className='text-[17px] font-bold text-white'>{text.storyComposer.posting}</p>
                    </div>
                  )}
                </div>

                {/* Active Controls - Only for Images */}
                {!isPending && isImage && (
                  <div className='flex w-full items-center justify-center gap-6 bg-black/60 px-6 py-4 backdrop-blur-md border-t border-white/5'>
                    <div className='flex items-center gap-4'>
                      <button
                        onClick={handleZoomOut}
                        className='flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-90'
                      >
                        <Minus className='h-4 w-4' />
                      </button>

                      <div className='relative flex h-1.5 w-32 items-center rounded-full bg-white/20 sm:w-48'>
                        <input
                          type='range'
                          min='0.5'
                          max='3'
                          step='0.1'
                          value={zoom}
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                        />
                        <div
                          className='h-full rounded-full bg-[#0068ff]'
                          style={{ width: `${((zoom - 0.5) / 2.5) * 100}%` }}
                        />
                        <div
                          className='absolute h-4 w-4 rounded-full border-2 border-[#0068ff] bg-white shadow-lg pointer-events-none'
                          style={{ left: `calc(${((zoom - 0.5) / 2.5) * 100}% - 8px)` }}
                        />
                      </div>

                      <button
                        onClick={handleZoomIn}
                        className='flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-90'
                      >
                        <Plus className='h-4 w-4' />
                      </button>
                    </div>

                    <button
                      type='button'
                      onClick={handleRotate}
                      className='flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-[13px] font-bold text-white transition-all hover:bg-white/20 active:scale-95'
                    >
                      <RotateCcw className='h-4 w-4' />
                      {text.storyComposer.rotate}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
