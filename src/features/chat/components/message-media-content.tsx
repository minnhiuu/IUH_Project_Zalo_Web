import { cn } from '@/lib/utils'
import type { MessageResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'
import { X, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

type AttachmentItem = NonNullable<MessageResponse['attachments']>[number]

export function MessageMediaContent({ message }: { message: MessageResponse }) {
  const { text } = useChatText()
  const atts = message.attachments || []
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = useCallback((idx: number) => setLightboxIndex(idx), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevImage = useCallback(() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i)), [])
  const nextImage = useCallback(
    () => setLightboxIndex((i) => (i !== null && i < atts.length - 1 ? i + 1 : i)),
    [atts.length]
  )

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowLeft') prevImage()
      else if (e.key === 'ArrowRight') nextImage()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, closeLightbox, prevImage, nextImage])

  if (atts.length === 0) {
    return <span className='text-muted-foreground italic'>{text.loading}</span>
  }

  if (atts.length === 1) {
    const att = atts[0]
    if (!att.url) return <span className='text-muted-foreground italic'>{text.loading}</span>
    if (att.contentType.startsWith('video/')) {
      return <video src={att.url} controls className='max-w-xs max-h-[300px] rounded-md' preload='metadata' />
    }
    return (
      <>
        <img
          src={att.url}
          alt={att.originalFileName || 'image'}
          className='max-w-xs max-h-[300px] rounded-md object-contain cursor-pointer hover:opacity-90 transition-opacity'
          loading='lazy'
          onClick={() => openLightbox(0)}
        />
        {lightboxIndex !== null && (
          <MediaLightbox
            atts={atts}
            index={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </>
    )
  }

  const gridClass = atts.length === 2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <>
      <div className={cn('grid gap-0.5 rounded-md overflow-hidden w-[240px]', gridClass)}>
        {atts.map((att, i) => {
          const isVideo = att.contentType.startsWith('video/')
          return (
            <div key={`${att.url}-${i}`} className='relative overflow-hidden bg-muted aspect-square'>
              {isVideo ? (
                <video src={att.url} className='w-full h-full object-cover' preload='metadata' />
              ) : (
                <img
                  src={att.url}
                  alt={att.originalFileName || 'image'}
                  className='w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity'
                  loading='lazy'
                  onClick={() => openLightbox(i)}
                />
              )}
              {isVideo && (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                  <div className='w-8 h-8 rounded-full bg-black/50 flex items-center justify-center'>
                    <Play size={14} className='text-white ml-0.5' />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {lightboxIndex !== null && (
        <MediaLightbox
          atts={atts}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </>
  )
}

function MediaLightbox({
  atts,
  index,
  onClose,
  onPrev,
  onNext
}: {
  atts: AttachmentItem[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const att = atts[index]
  const isVideo = att?.contentType?.startsWith('video/')
  return (
    <div className='fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center' onClick={onClose}>
      {/* Close */}
      <button
        className='absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors'
        onClick={onClose}
      >
        <X size={22} />
      </button>

      {/* Prev */}
      {atts.length > 1 && index > 0 && (
        <button
          className='absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors'
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Media */}
      <div
        className='max-w-[90vw] max-h-[90vh] flex items-center justify-center'
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video src={att.url} controls autoPlay className='max-w-full max-h-[90vh] rounded-md' />
        ) : (
          <img
            src={att.url}
            alt={att.originalFileName || 'image'}
            className='max-w-full max-h-[90vh] object-contain rounded-md select-none'
            draggable={false}
          />
        )}
      </div>

      {/* Next */}
      {atts.length > 1 && index < atts.length - 1 && (
        <button
          className='absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors'
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Counter */}
      {atts.length > 1 && (
        <div className='absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-[13px]'>
          {index + 1} / {atts.length}
        </div>
      )}
    </div>
  )
}
