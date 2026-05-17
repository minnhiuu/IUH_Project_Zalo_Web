import { useRef, useState, useEffect, type ChangeEvent, useMemo } from 'react'
import { Image, Video, Loader2, Eye, X, Play, Edit2 } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { PostCard, type SocialPost } from '../post/post-card'
import { cn } from '@/lib/utils'
import { useSocialText } from '../../i18n/use-social-text'
import { useCreateSocialPostMutation, useUpdateSocialPostMutation } from '../../queries/use-mutations'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { fileApi } from '../../api/file.api'
import { toast } from 'sonner'
import { VisibilityDropdown, type VisibilityType } from './visibility-dropdown'
import { extractHashtags } from '@/utils/hashtag'
import { BaseDialog } from '@/components/common/base-dialog'

import { EditMediaDialog } from './edit-media-dialog'

export type SelectedMedia = { file?: File; url?: string; type: 'IMAGE' | 'VIDEO' }
const IMAGE_MIME_PREFIX = 'image/'
const VIDEO_MIME_PREFIX = 'video/'

interface PostComposerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  inModal?: boolean
  className?: string
  initialPost?: SocialPost
  initialFiles?: File[]
  onPostSuccess?: () => void
  onCancel?: () => void
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
    if (!open) {
      const timer = setTimeout(() => setMediaUrls([]), 0)
      return () => clearTimeout(timer)
    }

    const urls = selectedMedia.map((m) => ({
      url: m.url || URL.createObjectURL(m.file!),
      type: m.type,
      isTemp: !m.url
    }))

    const timer = setTimeout(() => {
      setMediaUrls(urls.map(u => ({ url: u.url, type: u.type })))
    }, 0)

    return () => {
      clearTimeout(timer)
      urls.forEach((u) => {
        if (u.isTemp) {
          URL.revokeObjectURL(u.url)
        }
      })
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

export function MediaPreview({
  item,
  onRemove,
  className,
  hideRemove,
  overlayNumber,
  isSingleItem
}: {
  item: SelectedMedia
  onRemove: () => void
  className?: string
  hideRemove?: boolean
  overlayNumber?: number
  isSingleItem?: boolean
}) {
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    if (item.url) {
      setPreviewUrl(item.url)
      return
    }
    if (item.file) {
      const objectUrl = URL.createObjectURL(item.file)
      setPreviewUrl(objectUrl)
      return () => {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [item.url, item.file])

  if (!previewUrl) return null

  return (
    <div
      className={cn(
        'group relative flex items-center justify-center overflow-hidden rounded-xl border border-zinc-200/60 bg-zinc-100/50 dark:border-white/10 dark:bg-zinc-800/50',
        className
      )}
    >
      {item.type === 'IMAGE' ? (
        <img
          src={previewUrl}
          alt='Media preview'
          className={cn(
            'w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]',
            isSingleItem ? 'h-auto max-h-[400px]' : 'absolute inset-0 h-full'
          )}
        />
      ) : (
        <>
          <video
            src={previewUrl}
            className={cn(
              'w-full object-cover',
              isSingleItem ? 'h-auto max-h-[400px]' : 'absolute inset-0 h-full'
            )}
            playsInline
          />
          <div className='absolute inset-0 flex items-center justify-center z-10 pointer-events-none'>
            <div className='flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-black/40 text-white shadow-md backdrop-blur-sm'>
              <Play className='ml-1 h-6 w-6 fill-white' />
            </div>
          </div>
        </>
      )}
      {!hideRemove && (
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
      )}
      {overlayNumber !== undefined && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/50 z-20 pointer-events-none'>
          <span className='text-3xl font-bold text-white'>+{overlayNumber}</span>
        </div>
      )}
    </div>
  )
}

function ComposerBody({
  textareaClassName,
  initialPost,
  initialFiles,
  onPostSuccess,
  onCancel
}: {
  textareaClassName?: string
  initialPost?: SocialPost
  initialFiles?: File[]
  onPostSuccess?: () => void
  onCancel?: () => void
}) {
  const { text } = useSocialText()
  const { user } = useAuth()
  const myProfile = user
  const profileName = myProfile?.fullName?.trim() || text.composer.me
  const profileAvatar = myProfile?.avatar || ''
  const lastName = profileName.split(' ').pop() || profileName

  const [content, setContent] = useState(initialPost?.content || '')
  const [editMediaOpen, setEditMediaOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>(() => {
    if (initialPost?.media) {
      return initialPost.media.map((m) => ({ url: m.url, type: m.type as 'IMAGE' | 'VIDEO' }))
    }
    if (initialFiles?.length) {
      return initialFiles.map((file) => ({
        file,
        type: file.type.startsWith(IMAGE_MIME_PREFIX) ? 'IMAGE' : 'VIDEO'
      }))
    }
    return []
  })
  const [visibility, setVisibility] = useState<VisibilityType>(() => {
    if (initialPost?.visibility === 'Friends') return 'FRIEND'
    if (initialPost?.visibility === 'Private') return 'ONLY_ME'
    return (initialPost?.visibility as VisibilityType) || 'ALL'
  })
  const [previewOpen, setPreviewOpen] = useState(false)

  const { mutateAsync: createPost, isPending: isCreating } = useCreateSocialPostMutation()
  const { mutateAsync: updatePost, isPending: isUpdating } = useUpdateSocialPostMutation()
  const isPending = isCreating || isUpdating

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
      const trimmedContent = content.trim()
      const hashtags = extractHashtags(trimmedContent)

      const uploadedMedia = await Promise.all(
        selectedMedia.map(async (item) => {
          if (item.url && !item.file) {
            let backendUrl = item.url
            if (backendUrl.includes('.amazonaws.com/')) {
              backendUrl = backendUrl.split('.amazonaws.com/')[1]
            } else {
              // strip domain if necessary, or just keep it
            }
            return {
              url: backendUrl,
              type: item.type
            }
          }
          const response = await fileApi.upload(item.file!)
          return {
            url: response.data.data.key,
            type: item.type
          }
        })
      )

      if (initialPost) {
        await updatePost({
          postId: initialPost.id,
          payload: {
            visibility,
            caption: trimmedContent || undefined,
            hashtags: hashtags.length > 0 ? hashtags : [],
            media: uploadedMedia.length > 0 ? uploadedMedia : []
          }
        })
        toast.success('Post updated successfully')
      } else {
        await createPost({
          postType: 'FEED',
          visibility,
          caption: trimmedContent || undefined,
          hashtags: hashtags.length > 0 ? hashtags : undefined,
          media: uploadedMedia.length > 0 ? uploadedMedia : undefined
        })
        toast.success('Post created successfully')
      }

      if (!initialPost) {
        setContent('')
        setSelectedMedia([])
      }
      onPostSuccess?.()
    } catch {
      toast.error(initialPost ? 'Failed to update post' : 'Failed to create post')
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

  const mediaButtonClassName =
    'group h-9 rounded-full bg-zinc-100/80 px-4 text-zinc-600 transition-all dark:bg-zinc-800/50 dark:text-zinc-300'

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
          <div className='h-11 w-11 shrink-0 ring-2 ring-transparent'>
            <UserAvatar
              name={profileName}
              src={profileAvatar}
              className='w-full h-full border border-background'
              fallbackClassName='bg-primary text-white'
            />
          </div>
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

      <div className='flex flex-col gap-3 pt-2'>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={text.launcher.prompt(lastName)}
          className={cn(
            'min-h-[40px] resize-none border-none !bg-transparent p-0 text-[15.5px] leading-relaxed font-medium text-zinc-900 shadow-none focus-visible:ring-0 dark:!bg-transparent dark:text-[#ececec] placeholder:text-zinc-500 dark:placeholder:text-zinc-500',
            textareaClassName
          )}
        />

        {selectedMedia.length > 0 && (
          <div className='relative mt-1 overflow-hidden rounded-xl border border-zinc-200/80 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800/80 p-[1px] group/grid'>
            <div className='absolute left-3 top-3 z-30 opacity-0 group-hover/grid:opacity-100 transition-opacity'>
              <Button
                type='button'
                variant='secondary'
                onClick={() => setEditMediaOpen(true)}
                className='h-9 rounded-lg bg-white/90 px-4 text-[14px] font-semibold text-zinc-800 shadow-sm transition-all hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-100 dark:hover:bg-zinc-700'
              >
                <Edit2 className='w-4 h-4 mr-2' />
                Edit all
              </Button>
            </div>
            <div
              className={cn(
                'grid w-full gap-[1px] rounded-[10px] overflow-hidden',
                selectedMedia.length === 1 ? 'grid-cols-1' :
                (selectedMedia.length === 2 && selectedMedia.every((m) => m.type === 'VIDEO')) ? 'grid-cols-1 grid-rows-2 aspect-square' :
                selectedMedia.length === 2 ? 'grid-cols-2 aspect-square' :
                selectedMedia.length === 3 ? 'grid-cols-2 grid-rows-2 aspect-square' :
                selectedMedia.length === 4 ? 'grid-cols-2 grid-rows-2 aspect-square' :
                'grid-cols-2 grid-rows-6 aspect-square'
              )}
            >
              {selectedMedia.slice(0, 5).map((item, index) => (
                <MediaPreview
                  key={`${item.url || item.file?.name}-${index}`}
                  item={item}
                  onRemove={() => removeMedia(index)}
                  overlayNumber={selectedMedia.length > 5 && index === 4 ? selectedMedia.length - 4 : undefined}
                  isSingleItem={selectedMedia.length === 1}
                  className={cn(
                    'w-full h-full rounded-none border-none bg-black/5 dark:bg-black/20',
                    selectedMedia.length === 1 ? 'aspect-auto max-h-[400px]' : '',
                    selectedMedia.length === 3 && index === 0 ? 'col-span-2' : '',
                    selectedMedia.length >= 5 ? [
                      index === 0 ? 'col-start-1 col-span-1 row-start-1 row-span-3' : '',
                      index === 1 ? 'col-start-1 col-span-1 row-start-4 row-span-3' : '',
                      index === 2 ? 'col-start-2 col-span-1 row-start-1 row-span-2' : '',
                      index === 3 ? 'col-start-2 col-span-1 row-start-3 row-span-2' : '',
                      index === 4 ? 'col-start-2 col-span-1 row-start-5 row-span-2' : ''
                    ] : ''
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className='flex flex-col gap-4 border-t border-zinc-200 pt-4 dark:border-white/5'>
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

        <div className={cn('grid w-full gap-3', onCancel ? 'grid-cols-2' : 'grid-cols-1')}>
          {onCancel && (
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              className='h-11 w-full rounded-xl px-4 text-[15px] font-bold shadow-sm transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800'
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handlePost}
            disabled={!hasPostContent || isPending}
            className='h-11 w-full rounded-xl bg-primary px-6 text-[15px] font-bold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50 disabled:pointer-events-none'
          >
            {initialPost ? (
              (text.composer as Record<string, string>).save || 'Save'
            ) : (
              text.composer.post
            )}
          </Button>
        </div>
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

      <EditMediaDialog
        open={editMediaOpen}
        onOpenChange={setEditMediaOpen}
        selectedMedia={selectedMedia}
        onRemoveMedia={removeMedia}
        onAddMedia={(files) => {
          if (!files?.length) return
          const validFiles = Array.from(files)
          const next: SelectedMedia[] = validFiles.map((file) => ({
            file,
            type: file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO'
          }))
          setSelectedMedia((prev) => [...prev, ...next])
        }}
      />
      
      {isPending && (
        <div className='absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 rounded-xl sm:rounded-none'>
          <Loader2 className='h-10 w-10 animate-spin text-primary dark:text-white mb-3' />
          <p className='text-zinc-900 dark:text-white font-semibold text-[15.5px] tracking-wide'>
            {initialPost ? 'Saving...' : 'Posting'}
          </p>
        </div>
      )}
    </>
  )
}

export function PostComposer({
  open,
  onOpenChange,
  inModal = false,
  className,
  initialPost,
  initialFiles,
  onPostSuccess,
  onCancel
}: PostComposerProps) {
  const { text } = useSocialText()
  const title = initialPost ? (text.composer as Record<string, string>).editPost || 'Edit Post' : text.launcher.createPost

  if (open !== undefined && onOpenChange !== undefined) {
    return (
      <BaseDialog
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        className='sm:max-w-[500px]'
        noContentPadding
      >
        <div className={cn('relative flex w-full flex-col gap-4 bg-transparent p-4 sm:p-6 overflow-hidden', className)}>
          <ComposerBody
            textareaClassName='min-h-[40px]'
            initialPost={initialPost}
            initialFiles={initialFiles}
            onPostSuccess={() => {
              onPostSuccess?.()
              onOpenChange(false)
            }}
            onCancel={() => {
              onCancel?.()
              onOpenChange(false)
            }}
          />
        </div>
      </BaseDialog>
    )
  }

  if (inModal) {
    return (
      <div className={cn('relative flex w-full flex-col gap-4 bg-transparent overflow-hidden', className)}>
        <ComposerBody
          textareaClassName='min-h-[40px]'
          initialPost={initialPost}
          initialFiles={initialFiles}
          onPostSuccess={onPostSuccess}
          onCancel={onCancel}
        />
      </div>
    )
  }

  return (
    <Card
      className={cn(
        'shrink-0 overflow-visible border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md focus-within:ring-1 focus-within:ring-primary/30 dark:border-white/5 dark:bg-zinc-950/50 dark:backdrop-blur-xl rounded-xl',
        className
      )}
    >
      <CardContent className='relative space-y-4 p-5 sm:p-6'>
        <ComposerBody initialPost={initialPost} initialFiles={initialFiles} onPostSuccess={onPostSuccess} onCancel={onCancel} />
      </CardContent>
    </Card>
  )
}

