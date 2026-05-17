import { useState, useRef, useCallback } from 'react'
import { Video } from 'lucide-react'
import { BaseDialog } from '@/components/common/base-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
          <div className='flex-1 bg-reel-modal-bg flex items-center justify-center relative overflow-hidden'>
            {videoUrl ? (
              <div className='w-[85%] max-w-[850px] h-[75%] max-h-[550px] flex items-center justify-center rounded-xl overflow-hidden'>
                <video src={videoUrl} controls className='w-full h-full object-contain' autoPlay loop />
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
