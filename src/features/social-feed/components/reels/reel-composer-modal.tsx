import { Film, Upload, X } from 'lucide-react'
import { useEffect, useRef, type ChangeEvent } from 'react'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { VisibilityDropdown } from '../composer/visibility-dropdown'
import { useReelComposer } from './hooks/use-reel-composer'
import { useSocialText } from '../../i18n/use-social-text'
import { ReelVideoPlayer } from './reel-video-player'

interface ReelComposerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReelComposerModal({ open, onOpenChange }: ReelComposerModalProps) {
  const { text } = useSocialText()
  const composer = useReelComposer(open)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const {
    profileName,
    profileAvatar,
    visibility,
    setVisibility,
    caption,
    setCaption,
    videoFile,
    videoPreviewUrl,
    onPickVideoFile,
    clearVideo,
    submitReel,
    isSubmitting
  } = composer

  useEffect(() => {
    if (!import.meta.env.DEV || !videoPreviewUrl) {
      return
    }

    console.info('[ReelComposerModal] preview video source', {
      source: videoPreviewUrl,
      fileName: videoFile?.name ?? null
    })
  }, [videoPreviewUrl, videoFile?.name])

  const handleVideoInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null
    onPickVideoFile(selectedFile)
    event.currentTarget.value = ''
  }

  const handleSubmit = async () => {
    const isSuccess = await submitReel()
    if (isSuccess) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className='top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-none bg-zinc-100 p-0 dark:bg-zinc-950 sm:h-dvh sm:w-screen sm:max-w-none'
      >
        <DialogHeader className='sr-only'>
          <DialogTitle>{text.reelComposer.title}</DialogTitle>
          <DialogDescription>{text.reelComposer.dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className='grid h-full w-full grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,520px)]'>
          <div className='flex h-full items-center justify-center bg-linear-to-br from-zinc-900 to-zinc-700 p-6 dark:from-zinc-950 dark:to-zinc-900'>
            <div className='relative aspect-9/16 h-full max-h-[78vh] w-full max-w-107.5 overflow-hidden rounded-3xl border border-white/20 bg-black shadow-2xl'>
              {videoPreviewUrl ? (
                <ReelVideoPlayer
                  src={videoPreviewUrl}
                  ariaLabel={caption || text.reelComposer.title}
                  className='h-full w-full'
                />
              ) : (
                <div className='flex h-full w-full flex-col items-center justify-center gap-4 text-zinc-300'>
                  <Film className='h-12 w-12' />
                  <p className='text-center text-sm font-medium'>{text.reelComposer.previewEmpty}</p>
                </div>
              )}
            </div>
          </div>

          <div className='flex h-full flex-col overflow-y-auto bg-white px-5 py-7 sm:px-8 dark:bg-zinc-950'>
            <div className='mb-6'>
              <h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100'>{text.reelComposer.title}</h2>
              <p className='mt-1 text-sm text-zinc-600 dark:text-zinc-400'>{text.reelComposer.subtitle}</p>
            </div>

            <div className='mb-5 flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 p-3 dark:border-white/10'>
              <div className='flex min-w-0 items-center gap-3'>
                <div className='h-11 w-11 shrink-0'>
                  <UserAvatar
                    name={profileName}
                    src={profileAvatar}
                    className='h-full w-full border border-background'
                    fallbackClassName='bg-primary text-white'
                  />
                </div>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100'>{profileName}</p>
                  <VisibilityDropdown value={visibility} onChange={setVisibility} align='start' showIcon />
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <input
                ref={fileInputRef}
                type='file'
                accept='video/*'
                className='hidden'
                onChange={handleVideoInputChange}
              />

              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  className='rounded-full'
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className='h-4 w-4' />
                  {videoFile ? text.reelComposer.replaceVideo : text.reelComposer.pickVideo}
                </Button>

                {videoFile ? (
                  <Button type='button' variant='ghost' className='rounded-full' onClick={clearVideo}>
                    <X className='h-4 w-4' />
                    {text.reelComposer.removeVideo}
                  </Button>
                ) : null}
              </div>

              <p className='text-xs text-zinc-500 dark:text-zinc-400'>{text.reelComposer.videoHint}</p>

              <div className='rounded-2xl border border-zinc-200 p-3 dark:border-white/10'>
                <Textarea
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder={text.reelComposer.captionPlaceholder}
                  className='min-h-36 resize-none border-none bg-transparent p-0 text-sm text-zinc-900 shadow-none focus-visible:ring-0 dark:text-zinc-100'
                />
              </div>
            </div>

            <div className='mt-auto pt-6'>
              <Button
                type='button'
                onClick={handleSubmit}
                disabled={isSubmitting || !videoFile}
                className='h-11 w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
              >
                {isSubmitting ? text.reelComposer.publishing : text.reelComposer.publish}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
