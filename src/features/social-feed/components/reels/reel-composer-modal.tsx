import { useState, useRef, useCallback } from 'react'
import { Video, MessageCircle, Send, MoreHorizontal } from 'lucide-react'
import { BaseDialog } from '@/components/common/base-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/common/user-avatar'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { cn } from '@/lib/utils'
import { useSocialText } from '../../i18n/use-social-text'
import { toast } from 'sonner'
import { useCreateSocialPostMutation } from '../../queries/use-mutations'
import { fileApi } from '../../api/file.api'
import { extractHashtags } from '@/utils/hashtag'

interface ReelComposerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReelComposerModal({ open, onOpenChange }: ReelComposerModalProps) {
  const { user } = useAuthContext()
  const { text } = useSocialText()
  const { mutateAsync: createPost, isPending } = useCreateSocialPostMutation()
  
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isPublishing = isUploading || isPending

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleProcessFile(file)
  }

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error(text.reelComposer.invalidVideo)
      return
    }

    if (videoUrl) URL.revokeObjectURL(videoUrl)

    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file) handleProcessFile(file)
    },
    []
  )

  const handlePublish = async () => {
    if (!videoFile) return
    setIsUploading(true)
    try {
      const uploadResponse = await fileApi.upload(videoFile)
      const key = uploadResponse.data.data.key

      const trimmedCaption = caption.trim()
      const hashtags = extractHashtags(trimmedCaption)

      await createPost({
        postType: 'REEL',
        visibility: 'ALL',
        caption: trimmedCaption || undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        media: [{ url: key, type: 'VIDEO' }]
      })

      toast.success(text.reelComposer.successToast)
      onOpenChange(false)
    } catch (error) {
      toast.error(text.reelComposer.errorToast)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <BaseDialog
        open={open}
        onOpenChange={(isOpen) => {
          onOpenChange(isOpen)
          if (!isOpen) {
            if (videoUrl) URL.revokeObjectURL(videoUrl)
            setVideoFile(null)
            setVideoUrl(null)
            setCaption('')
          }
        }}
        title={text.reelComposer.title}
        className='sm:max-w-[90vw] lg:max-w-[1200px] xl:max-w-[1400px] w-full overflow-hidden'
        noContentPadding
        hideFooterBorder
      >
        <div className='flex flex-col sm:flex-row w-full h-[75vh] min-h-[600px] max-h-[850px] bg-background'>
          {/* Left Panel */}
          <div className='w-full sm:w-[360px] flex flex-col border-r border-border bg-card z-10'>
            <div className='flex-1 overflow-y-auto p-4 no-scrollbar'>
              <input type='file' accept='video/*' className='hidden' ref={fileInputRef} onChange={handleFileChange} />

              <div
                className={cn(
                  'border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors',
                  isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent',
                  videoFile ? 'h-32' : 'h-48'
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className='w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3'>
                  <Video className='w-6 h-6 text-muted-foreground' />
                </div>
                <h3 className='text-[15px] font-bold text-foreground mb-1'>
                  {videoFile ? text.reelComposer.replaceVideo : text.reelComposer.pickVideo}
                </h3>
                <p className='text-[13px] text-muted-foreground'>{text.reelComposer.uploadHint}</p>
              </div>

              {videoFile && (
                <div className='mt-6 flex flex-col gap-2'>
                  <span className='text-[14px] font-semibold text-foreground'>{text.storyComposer.captionLabel}</span>
                  <Textarea
                    placeholder={text.reelComposer.captionPlaceholder}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className='w-full min-h-[120px] resize-none bg-background border-border text-[15px]'
                  />
                </div>
              )}
            </div>

            <div className='mt-auto p-4 border-t border-border bg-card'>
              <Button
                onClick={handlePublish}
                disabled={!videoFile || isPublishing}
                className='w-full h-11 rounded-xl text-[15px] font-bold shadow-sm'
              >
                {isPublishing ? text.reelComposer.publishing : (videoFile ? text.reelComposer.publish : text.reelComposer.upload)}
              </Button>
            </div>
          </div>

          {/* Right Panel (Preview) */}
          <div className='flex-1 bg-reel-modal-bg flex items-center justify-center relative overflow-hidden py-4 sm:py-8'>
            {videoUrl ? (
              <div className='relative flex h-full w-full max-w-[360px] aspect-[9/16] items-center justify-center bg-black rounded-xl overflow-hidden shadow-2xl'>
                <video src={videoUrl} controls={false} className='absolute inset-0 w-full h-full object-cover' autoPlay loop muted playsInline />
                
                {/* Overlay: Text (Bottom Left) */}
                <div className='absolute bottom-0 left-0 right-14 z-20 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pb-6 pt-12 text-white pointer-events-none'>
                  <div className='mb-3 flex items-center gap-3'>
                    <div className='h-10 w-10 shrink-0'>
                      <UserAvatar
                        name={user?.fullName || 'You'}
                        src={user?.avatar}
                        className='w-full h-full border border-white/20'
                        fallbackClassName='bg-primary text-white text-[11px]'
                      />
                    </div>
                    <div className='text-[15px] font-bold tracking-wide drop-shadow-md'>
                      {user?.fullName || 'You'}
                    </div>
                  </div>
                  <p className='line-clamp-3 whitespace-pre-line text-[14px] leading-relaxed text-white/90 drop-shadow-md pointer-events-auto'>
                    {caption || text.reelComposer.captionPlaceholder}
                  </p>
                </div>

                {/* Right Overlay: Actions */}
                <div className='absolute bottom-6 right-2 z-30 flex flex-col items-center gap-5'>
                  <div className='flex flex-col items-center gap-1.5 text-white'>
                    <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 shadow-xl backdrop-blur-xl'>
                      <svg viewBox='0 0 24 24' className='h-5 w-5 text-white' fill='none' stroke='currentColor' strokeWidth={2}>
                        <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
                      </svg>
                    </span>
                    <span className='text-[11px] font-bold drop-shadow-md'>0</span>
                  </div>

                  <div className='flex flex-col items-center gap-1.5 text-white'>
                    <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 shadow-xl backdrop-blur-xl'>
                      <MessageCircle className='h-5 w-5 text-white' />
                    </span>
                    <span className='text-[11px] font-bold drop-shadow-md'>0</span>
                  </div>

                  <div className='flex flex-col items-center gap-1.5 text-white'>
                    <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 shadow-xl backdrop-blur-xl'>
                      <Send className='h-5 w-5 pr-0.5 text-white' />
                    </span>
                    <span className='text-[11px] font-bold drop-shadow-md'>0</span>
                  </div>

                  <div className='flex flex-col items-center gap-1.5 text-white'>
                    <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 shadow-xl backdrop-blur-xl'>
                      <MoreHorizontal className='h-5 w-5 text-white' />
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className='w-[85%] max-w-[850px] h-[75%] max-h-[550px] flex flex-col bg-card rounded-xl shadow-md overflow-hidden'>
                <div className='px-4 py-3'>
                  <span className='text-[15px] font-bold text-foreground'>{text.storyComposer.preview}</span>
                </div>
                <div className='flex-1 px-4 pb-4'>
                  <div className='w-full h-full bg-reel-preview-bg rounded-lg overflow-hidden flex items-center justify-center relative'>
                    <div className='text-center p-6 text-muted-foreground'>
                      <p className='font-semibold text-foreground text-[15px] mb-1'>
                        {text.reelComposer.videoPreviewTitle}
                      </p>
                      <p className='text-[13px]'>{text.reelComposer.videoPreviewDesc}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </BaseDialog>
    </>
  )
}
