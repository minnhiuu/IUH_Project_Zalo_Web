import { useState, useRef, type ChangeEvent } from 'react'
import { Send, Image as ImageIcon, Video, X, Loader2 } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useSocialText } from '../../i18n/use-social-text'
import { fileApi } from '../../api/file.api'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { toast } from 'sonner'
import type { CommentMediaRequest } from '../../schemas/comment.schema'

type SelectedMedia = { file: File; type: 'IMAGE' | 'VIDEO' }
const IMAGE_MIME_PREFIX = 'image/'
const VIDEO_MIME_PREFIX = 'video/'

interface CommentInputProps {
  placeholder?: string
  isSubmitting?: boolean
  currentUserName?: string
  currentUserAvatar?: string | null
  replyTarget?: {
    id: string
    authorName: string
  } | null
  onCancelReply?: () => void
  onSubmit?: (content: string, parentId?: string, media?: CommentMediaRequest[]) => Promise<void>
}

export function CommentInput({
  placeholder,
  isSubmitting = false,
  currentUserName,
  currentUserAvatar,
  replyTarget = null,
  onCancelReply,
  onSubmit
}: CommentInputProps) {
  const { text } = useSocialText()
  const { user } = useAuthContext()
  const [commentText, setCommentText] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([])
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  const currentUserLabel = currentUserName?.trim() || user?.fullName || text.composer.me
  const resolvedCurrentUserAvatar =
    currentUserAvatar !== undefined
      ? currentUserAvatar
      : user?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(currentUserLabel)}`

  const trimmedComment = commentText.trim()

  const addMedia = (files: FileList | null) => {
    if (!files?.length) return
    const validFiles = Array.from(files).filter(
      (f) => f.type.startsWith(IMAGE_MIME_PREFIX) || f.type.startsWith(VIDEO_MIME_PREFIX)
    )
    if (!validFiles.length) {
      toast.error(text.commentInput.invalidMedia)
      return
    }
    const next = validFiles.map((file) => ({
      file,
      type: file.type.startsWith(IMAGE_MIME_PREFIX) ? ('IMAGE' as const) : ('VIDEO' as const)
    }))
    setSelectedMedia((prev) => [...prev, ...next])
  }

  const removeMedia = (index: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index))
  }

  const onPickImage = (event: ChangeEvent<HTMLInputElement>) => {
    addMedia(event.target.files)
    event.currentTarget.value = ''
  }

  const onPickVideo = (event: ChangeEvent<HTMLInputElement>) => {
    addMedia(event.target.files)
    event.currentTarget.value = ''
  }

  const handleSubmit = async () => {
    if ((!trimmedComment && selectedMedia.length === 0) || isSubmitting || isUploadingMedia || !onSubmit) {
      return
    }

    try {
      setIsUploadingMedia(true)
      let uploadedMedia: CommentMediaRequest[] | undefined = undefined

      if (selectedMedia.length > 0) {
        uploadedMedia = await Promise.all(
          selectedMedia.map(async (item) => {
            const response = await fileApi.upload(item.file)
            const key = response.data.data.key
            return {
              url: `${import.meta.env.VITE_API_BASE_URL}/files/download/${encodeURIComponent(key)}`,
              type: item.type
            }
          })
        )
      }

      await onSubmit(trimmedComment, replyTarget?.id, uploadedMedia)
      setCommentText('')
      setSelectedMedia([])
    } catch {
      toast.error(text.commentInput.uploadFailed)
    } finally {
      setIsUploadingMedia(false)
    }
  }

  return (
    <div className='flex items-start gap-3'>
      <div className='mt-1 h-9 w-9 shrink-0'>
        <UserAvatar
          name={currentUserLabel}
          src={resolvedCurrentUserAvatar}
          className='w-full h-full border border-background'
          fallbackClassName='bg-primary text-white text-xs font-semibold'
        />
      </div>
      <div className='relative flex-1'>
        {replyTarget ? (
          <div className='mb-2 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-white/10 dark:bg-zinc-900'>
            <p className='text-xs font-medium text-zinc-600 dark:text-zinc-300'>
              {text.commentInput.replyingTo(replyTarget.authorName)}
            </p>
            <button
              type='button'
              onClick={onCancelReply}
              className='text-xs font-semibold text-zinc-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400'
            >
              {text.commentInput.cancel}
            </button>
          </div>
        ) : null}

        {selectedMedia.length > 0 && (
          <div className='mb-2 flex flex-wrap gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-zinc-900'>
            {selectedMedia.map((media, index) => (
              <div
                key={`${media.file.name}-${index}`}
                className='relative h-16 w-16 overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10'
              >
                {media.type === 'IMAGE' ? (
                  <img src={URL.createObjectURL(media.file)} alt='preview' className='h-full w-full object-cover' />
                ) : (
                  <video src={URL.createObjectURL(media.file)} className='h-full w-full object-cover' />
                )}
                <button
                  type='button'
                  onClick={() => removeMedia(index)}
                  className='absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80'
                >
                  <X className='h-3 w-3' />
                </button>
              </div>
            ))}
          </div>
        )}

        <Textarea
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          rows={1}
          placeholder={placeholder ?? text.commentsModal.inputPlaceholder}
          className='min-h-[44px] resize-none rounded-2xl border-zinc-200 bg-zinc-50 py-3 pr-[104px] text-[14px] shadow-none transition-colors focus-visible:ring-indigo-500/30 dark:border-white/10 dark:bg-zinc-900'
        />

        <input
          ref={imageInputRef}
          type='file'
          accept='image/png, image/jpeg, image/jpg, image/webp'
          multiple
          className='hidden'
          onChange={onPickImage}
        />
        <input ref={videoInputRef} type='file' accept='video/*' multiple className='hidden' onChange={onPickVideo} />

        <div className='absolute right-1.5 bottom-1.5 flex items-center gap-0.5'>
          <Button
            type='button'
            size='icon'
            variant='ghost'
            onClick={() => imageInputRef.current?.click()}
            disabled={isSubmitting || isUploadingMedia}
            className='h-8 w-8 rounded-full hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-50 transition-colors'
            title={text.commentInput.uploadPhoto}
          >
            <ImageIcon className='h-4.5 w-4.5 text-emerald-500' />
          </Button>
          <Button
            type='button'
            size='icon'
            variant='ghost'
            onClick={() => videoInputRef.current?.click()}
            disabled={isSubmitting || isUploadingMedia}
            className='h-8 w-8 rounded-full hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-50 transition-colors'
            title={text.commentInput.uploadVideo}
          >
            <Video className='h-4.5 w-4.5 text-rose-500' />
          </Button>
          <Button
            type='button'
            size='icon'
            variant='ghost'
            onClick={handleSubmit}
            disabled={(!trimmedComment && selectedMedia.length === 0) || isSubmitting || isUploadingMedia}
            className='h-8 w-8 rounded-full text-indigo-500 hover:bg-indigo-500/10 disabled:text-zinc-400 disabled:hover:bg-transparent transition-colors'
          >
            {isUploadingMedia ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className='h-4.5 w-4.5' />}
          </Button>
        </div>
      </div>
    </div>
  )
}
