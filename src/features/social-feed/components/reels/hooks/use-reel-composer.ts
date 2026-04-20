import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useMyProfile } from '@/features/user/queries/use-queries'
import { useSocialText } from '../../../i18n/use-social-text'
import { useCreateSocialPostMutation } from '../../../queries/use-mutations'
import { fileApi } from '../../../api/file.api'
import type { VisibilityType } from '../../composer/visibility-dropdown'

export interface UseReelComposerResult {
  profileName: string
  profileAvatar: string
  visibility: VisibilityType
  setVisibility: React.Dispatch<React.SetStateAction<VisibilityType>>
  caption: string
  setCaption: React.Dispatch<React.SetStateAction<string>>
  videoFile: File | null
  videoPreviewUrl: string | null
  onPickVideoFile: (file: File | null) => void
  clearVideo: () => void
  submitReel: () => Promise<boolean>
  isSubmitting: boolean
}

export function useReelComposer(open: boolean): UseReelComposerResult {
  const { text } = useSocialText()
  const { data: myProfile } = useMyProfile()
  const { mutateAsync: createPost, isPending } = useCreateSocialPostMutation()

  const [visibility, setVisibility] = useState<VisibilityType>('ALL')
  const [caption, setCaption] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const profileName = myProfile?.fullName?.trim() || text.composer.me
  const profileAvatar = myProfile?.avatar || ''

  const clearVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl)
    }
    setVideoFile(null)
    setVideoPreviewUrl(null)
  }

  const resetComposer = () => {
    clearVideo()
    setCaption('')
    setVisibility('ALL')
    setIsUploading(false)
  }

  useEffect(() => {
    if (!open) {
      resetComposer()
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const onPickVideoFile = (file: File | null) => {
    if (!file) {
      return
    }

    if (!file.type.startsWith('video/')) {
      toast.error(text.reelComposer.invalidVideo)
      return
    }

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl)
    }

    setVideoFile(file)
    setVideoPreviewUrl(URL.createObjectURL(file))
  }

  const submitReel = async () => {
    if (!videoFile) {
      toast.error(text.reelComposer.videoRequired)
      return false
    }

    try {
      setIsUploading(true)
      const uploadResponse = await fileApi.upload(videoFile)
      const key = uploadResponse.data.data.key

      await createPost({
        postType: 'REEL',
        visibility,
        caption: caption.trim() || undefined,
        media: [{ url: key, type: 'VIDEO' }]
      })

      toast.success(text.reelComposer.successToast)
      resetComposer()
      return true
    } catch {
      toast.error(text.reelComposer.errorToast)
      return false
    } finally {
      setIsUploading(false)
    }
  }

  return {
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
    isSubmitting: isUploading || isPending
  }
}
