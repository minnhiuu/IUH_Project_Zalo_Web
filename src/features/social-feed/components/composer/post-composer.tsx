import { useRef, useState, useEffect, type ChangeEvent } from 'react'
import { Image, Video, Loader2, X, Eye } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { PostCard, type SocialPost } from '../post/post-card'
import { cn } from '@/lib/utils'
import { useMyProfile } from '@/features/user/queries/use-queries'
import { useSocialText } from '../../i18n/use-social-text'
import { useCreateSocialPostMutation } from '../../queries/use-mutations'
import { fileApi } from '../../api/file.api'
import { toast } from 'sonner'
import { VisibilityDropdown, type VisibilityType } from './visibility-dropdown'

// VisibilityType is imported from visibility-dropdown
type SelectedMedia = { file: File; type: 'IMAGE' | 'VIDEO' }
const IMAGE_MIME_PREFIX = 'image/'
const VIDEO_MIME_PREFIX = 'video/'

interface PostComposerProps {
  inModal?: boolean
  className?: string
  onPostSuccess?: () => void
}

function PostPreviewDialog({
  open,
  onOpenChange,
  authorName,
  authorAvatar,
  visibility,
  content,
  selectedMedia
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  authorName: string
  authorAvatar: string
  visibility: string
  content: string
  selectedMedia: SelectedMedia[]
}) {
  const [mediaUrls, setMediaUrls] = useState<{ url: string; type: 'IMAGE' | 'VIDEO' }[]>([])

  useEffect(() => {
    if (open) {
      const urls = selectedMedia.map((m) => ({
        url: URL.createObjectURL(m.file),
        type: m.type
      }))
      setMediaUrls(urls)
      return () => {
        urls.forEach((u) => URL.revokeObjectURL(u.url))
      }
    }
  }, [open, selectedMedia])

  if (!open) return null

  const mapVisibility = (v: string): 'Public' | 'Friends' | 'Private' => {
    if (v === 'FRIENDS') return 'Friends'
    if (v === 'ONLY_ME') return 'Private'
    return 'Public'
  }

  const previewPost: SocialPost = {
    id: 'preview',
    authorName,
    authorAvatar,
    postType: 'FEED',
    postedAt: new Date().toISOString(),
    visibility: mapVisibility(visibility),
    content,
    media: mediaUrls,
    reactions: 0,
    comments: 0,
    shares: 0,
    views: 0
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] overflow-y-auto border-none bg-transparent p-0 shadow-none sm:max-w-[500px] [&>button]:hidden'>
        <DialogHeader className='sr-only'>
          <DialogTitle>Post Preview</DialogTitle>
          <DialogDescription>Previewing your post</DialogDescription>
        </DialogHeader>
        <div className='pointer-events-none relative w-full'>
          <PostCard post={previewPost} />
          <div className='absolute right-2 top-2 z-50 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs font-bold tracking-wider text-white backdrop-blur-md'>
            <Eye className='h-3.5 w-3.5' /> PREVIEW
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MediaPreview({
  file,
  type,
  onRemove,
  className
}: {
  file: File
  type: 'IMAGE' | 'VIDEO'
  onRemove: () => void
  className?: string
}) {
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  if (!previewUrl) return null

  return (
    <div
      className={cn(
        'group relative flex items-center justify-center overflow-hidden rounded-xl border border-zinc-200/60 bg-zinc-100/50 dark:border-white/10 dark:bg-zinc-800/50',
        className
      )}
    >
      {type === 'IMAGE' ? (
        <img
          src={previewUrl}
          alt={file.name}
          className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]'
        />
      ) : (
        <video
          src={previewUrl}
          className='absolute inset-0 h-full w-full object-cover'
          autoPlay
          muted
          loop
          playsInline
        />
      )}
      <button
        type='button'
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove()
        }}
        className='absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1.5 text-white/90 opacity-0 ring-1 ring-white/20 backdrop-blur-md transition-all hover:scale-110 hover:bg-black/80 hover:text-white group-hover:opacity-100'
        title='Remove media'
      >
        <X className='h-[14px] w-[14px]' />
      </button>
      {type === 'VIDEO' && (
        <div className='absolute bottom-2 left-2 z-10 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold tracking-wider text-white ring-1 ring-white/20 backdrop-blur-md'>
          VIDEO
        </div>
      )}
    </div>
  )
}

function ComposerBody({
  textareaClassName,
  onPostSuccess
}: {
  textareaClassName?: string
  onPostSuccess?: () => void
}) {
  const { text } = useSocialText()
  const currentUserLabel = text.composer.me
  const { data: myProfile } = useMyProfile()
  const profileName = myProfile?.fullName?.trim() || currentUserLabel
  const profileAvatar =
    myProfile?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(profileName)}`

  const [content, setContent] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([])
  const [visibility, setVisibility] = useState<VisibilityType>('ALL')
  const [previewOpen, setPreviewOpen] = useState(false)
  const { mutateAsync: createPost, isPending } = useCreateSocialPostMutation()
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  const addMedia = (files: FileList | null, type: 'IMAGE' | 'VIDEO') => {
    if (!files?.length) return

    const expectedPrefix = type === 'IMAGE' ? IMAGE_MIME_PREFIX : VIDEO_MIME_PREFIX
    const validFiles = Array.from(files).filter((file) => file.type.startsWith(expectedPrefix))

    if (validFiles.length === 0) {
      toast.error(type === 'IMAGE' ? 'Please select image files only' : 'Please select video files only')
      return
    }

    if (validFiles.length !== files.length) {
      toast.error(type === 'IMAGE' ? 'Some files were skipped (not images)' : 'Some files were skipped (not videos)')
    }

    const next = validFiles.map((file) => ({ file, type }))
    setSelectedMedia((prev) => [...prev, ...next])
  }

  const removeMedia = (index: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePost = async () => {
    if (!content.trim() && selectedMedia.length === 0) return

    try {
      const uploadedMedia = await Promise.all(
        selectedMedia.map(async (item) => {
          const response = await fileApi.upload(item.file)
          const key = response.data.data.key

          return {
            url: key,
            type: item.type
          }
        })
      )

      await createPost({
        postType: 'FEED',
        visibility,
        caption: content.trim() || undefined,
        media: uploadedMedia.length > 0 ? uploadedMedia : undefined
      })

      setContent('')
      setSelectedMedia([])
      toast.success('Post created successfully')
      onPostSuccess?.()
    } catch {
      toast.error('Failed to create post')
    }
  }

  // Visibility options are managed by VisibilityDropdown

  const hasPostContent = content.trim().length > 0 || selectedMedia.length > 0

  const openImagePicker = () => {
    imageInputRef.current?.click()
  }

  const openVideoPicker = () => {
    videoInputRef.current?.click()
  }

  const resetInputValue = (event: ChangeEvent<HTMLInputElement>) => {
    event.currentTarget.value = ''
  }

  const onPickImage = (event: ChangeEvent<HTMLInputElement>) => {
    addMedia(event.target.files, 'IMAGE')
    resetInputValue(event)
  }

  const onPickVideo = (event: ChangeEvent<HTMLInputElement>) => {
    addMedia(event.target.files, 'VIDEO')
    resetInputValue(event)
  }

  const mediaButtonClassName = 'group h-9 rounded-full bg-zinc-100/80 px-4 text-zinc-600 transition-all dark:bg-zinc-800/50 dark:text-zinc-300'

  return (
    <>
      <input
        ref={imageInputRef}
        type='file'
        accept='image/png, image/jpeg, image/jpg, image/webp'
        multiple
        className='hidden'
        onChange={onPickImage}
      />
      <input ref={videoInputRef} type='file' accept='video/*' multiple className='hidden' onChange={onPickVideo} />

      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <UserAvatar
            name={profileName}
            src={profileAvatar}
            className='h-11 w-11 shrink-0 border border-zinc-200 shadow-sm ring-2 ring-transparent transition-all dark:border-white/5'
            fallbackClassName='bg-indigo-500/10 text-indigo-500'
          />
          <div className='min-w-0'>
            <p className='truncate text-[14.5px] font-semibold text-zinc-900 dark:text-[#ececec]'>{profileName}</p>
            <VisibilityDropdown
              value={visibility}
              onChange={setVisibility}
              align='start'
              showIcon
              triggerClassName='mt-0.5'
            />
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-3 sm:p-4 shadow-inner transition-colors focus-within:border-indigo-400/50 focus-within:bg-white dark:border-white/10 dark:bg-zinc-900/40 dark:focus-within:bg-zinc-900'>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={text.composer.placeholder}
          className={cn(
            'min-h-16 resize-none border-none bg-transparent p-0 text-[15.5px] leading-relaxed font-medium text-zinc-900 shadow-none focus-visible:ring-0 dark:text-[#ececec] placeholder:text-zinc-500 dark:placeholder:text-zinc-500',
            textareaClassName
          )}
        />

        {selectedMedia.length > 0 && (
          <div className='flex flex-wrap gap-2 pt-1'>
            {selectedMedia.map((item, index) => (
              <MediaPreview
                key={`${item.file.name}-${index}`}
                file={item.file}
                type={item.type}
                onRemove={() => removeMedia(index)}
                className={cn(
                  'shrink-0',
                  selectedMedia.length === 1
                    ? 'h-[160px] w-[160px] sm:h-[200px] sm:w-[200px]'
                    : 'h-[80px] w-[80px] sm:h-[100px] sm:w-[100px]'
                )}
              />
            ))}
          </div>
        )}
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4 dark:border-white/5'>
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={openImagePicker}
            className={cn(
              mediaButtonClassName,
              'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400'
            )}
          >
            <Image className='h-[18px] w-[18px] text-emerald-500 transition-transform group-hover:scale-110' />
            <span className='hidden sm:inline text-[13.5px] font-semibold tracking-tight'>{text.composer.image}</span>
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={openVideoPicker}
            className={cn(
              mediaButtonClassName,
              'hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400'
            )}
          >
            <Video className='h-[18px] w-[18px] text-rose-500 transition-transform group-hover:scale-110' />
            <span className='hidden sm:inline text-[13.5px] font-semibold tracking-tight'>{text.composer.video}</span>
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => setPreviewOpen(true)}
            disabled={!hasPostContent}
            className={cn(
              mediaButtonClassName,
              'hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400'
            )}
          >
            <Eye className='h-[18px] w-[18px] text-blue-500 transition-transform group-hover:scale-110' />
            <span className='hidden sm:inline text-[13.5px] font-semibold tracking-tight'>
              {(text.composer as Record<string, string>).preview ?? 'Preview'}
            </span>
          </Button>
        </div>

        <Button
          onClick={handlePost}
          disabled={!hasPostContent || isPending}
          className='h-10 min-w-24 rounded-xl bg-indigo-500 px-6 font-semibold text-white shadow-sm transition-all hover:bg-indigo-600 hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none'
        >
          {isPending ? <Loader2 className='h-5 w-5 animate-spin' /> : text.composer.post}
        </Button>
      </div>

      <PostPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        authorName={profileName}
        authorAvatar={profileAvatar}
        visibility={visibility}
        content={content}
        selectedMedia={selectedMedia}
      />
    </>
  )
}

export function PostComposer({ inModal = false, className, onPostSuccess }: PostComposerProps) {
  if (inModal) {
    return (
      <div
        className={cn(
          'mx-auto flex w-full max-w-none flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950',
          className
        )}
      >
        <ComposerBody textareaClassName='min-h-44 sm:min-h-56' onPostSuccess={onPostSuccess} />
      </div>
    )
  }

  return (
    <Card
      className={cn(
        'shrink-0 overflow-visible border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md focus-within:ring-1 focus-within:ring-indigo-500/30 dark:border-white/5 dark:bg-zinc-950/50 dark:backdrop-blur-xl',
        className
      )}
    >
      <CardContent className='space-y-4 p-5 sm:p-6'>
        <ComposerBody onPostSuccess={onPostSuccess} />
      </CardContent>
    </Card>
  )
}
