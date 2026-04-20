import { ImageIcon, Video, UploadCloud, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSocialText } from '../../../i18n/use-social-text'
import { StoryViewerPanel } from '../story-viewer-panel'
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
}

export function StoryCanvas({
  mediaPreviewUrl,
  mediaType,
  profileName,
  profileAvatar,
  caption,
  selectedTrack,
  onClearMedia,
  onPickImage,
  onPickVideo
}: StoryCanvasProps) {
  const { text } = useSocialText()
  const isImage = mediaType === 'IMAGE'

  return (
    <div className='relative flex flex-1 flex-col items-center justify-center overflow-hidden'>

      {/* Ambient gradient backdrop */}
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-zinc-950/80 to-violet-950/30' />

      {/* Blurred media backdrop */}
      {mediaPreviewUrl && isImage && (
        <div
          className='pointer-events-none absolute inset-0 transition-opacity duration-700'
          style={{
            backgroundImage: `url(${mediaPreviewUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(50px) brightness(0.25) saturate(1.4)',
            transform: 'scale(1.15)'
          }}
        />
      )}

      {/* Dot-grid texture */}
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.03]'
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      {/* Story viewer panel — live preview */}
      <StoryViewerPanel
        mediaUrl={mediaPreviewUrl}
        mediaType={mediaType}
        mediaAlt='Story preview'
        authorName={profileName}
        authorAvatar={profileAvatar}
        caption={caption.trim() || undefined}
        // Pass selected track as the music prop so the badge renders
        music={
          selectedTrack
            ? {
                jamendoId: selectedTrack.id,
                title: selectedTrack.title,
                artistName: selectedTrack.artist,
                audioUrl: selectedTrack.audio,
                coverUrl: selectedTrack.coverUrl ?? null
              }
            : undefined
        }
        /* Remove-media button in the header trailing slot */
        headerTrailing={
          mediaPreviewUrl ? (
            <button
              type='button'
              onClick={onClearMedia}
              className='ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70 hover:scale-110 active:scale-95'
              aria-label='Remove media'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          ) : undefined
        }
        /* Empty state when no media is picked */
        emptyState={
          <div className={cn(
            'flex h-full w-full flex-col items-center justify-center gap-7 p-8',
            'bg-gradient-to-b from-zinc-900 to-zinc-950'
          )}>
            <div className='relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.06] ring-1 ring-white/10'>
              <UploadCloud className='h-9 w-9 text-zinc-400' />
              <div className='absolute -top-2 -right-2 rounded-full bg-indigo-500 p-1 shadow-lg shadow-indigo-500/40'>
                <Sparkles className='h-3 w-3 text-white' />
              </div>
            </div>
            <div className='text-center space-y-1.5'>
              <p className='text-[15px] font-bold text-zinc-100'>{text.storyComposer.pickMediaTitle}</p>
              <p className='text-[12.5px] leading-relaxed text-zinc-500'>{text.storyComposer.pickMediaSubtitle}</p>
            </div>
            <div className='flex flex-col gap-2.5 w-full max-w-[200px]'>
              <button
                type='button'
                onClick={onPickImage}
                className='flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 px-5 py-3 text-[13.5px] font-semibold text-emerald-300 transition-all hover:from-emerald-500/30 hover:border-emerald-400/50 hover:scale-[1.03] active:scale-[0.98]'
              >
                <ImageIcon className='h-4 w-4' />
                {text.storyComposer.addImage}
              </button>
              <button
                type='button'
                onClick={onPickVideo}
                className='flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-rose-500/20 to-pink-500/10 border border-rose-500/30 px-5 py-3 text-[13.5px] font-semibold text-rose-300 transition-all hover:from-rose-500/30 hover:border-rose-400/50 hover:scale-[1.03] active:scale-[0.98]'
              >
                <Video className='h-4 w-4' />
                {text.storyComposer.addVideo}
              </button>
            </div>
          </div>
        }
      />
    </div>
  )
}
