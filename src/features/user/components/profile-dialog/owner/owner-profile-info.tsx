import { useRef, useState } from 'react'
import { Camera, Pencil } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getCroppedImg } from '@/utils/image-crop'
import { useUpdateAvatarMutation } from '../../../queries/use-mutations'
import { useUserText } from '../../../i18n/use-user-text'
import { type UserResponse } from '@/features/user/schemas/user.schema'
import { ProfileInfoBase } from '../shared/profile-info-base'
import { BackgroundEditor } from './background-editor'
import { UpdateImageDialog } from './update-image-dialog'
import { DeactivatedProfileState } from '../shared/deactivated-profile-state'

interface OwnerProfileInfoProps {
  user: UserResponse
  onEdit: () => void
}

export function OwnerProfileInfo({ user, onEdit }: OwnerProfileInfoProps) {
  const { text } = useUserText()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const updateAvatarMutation = useUpdateAvatarMutation()

  const [selectedImage, setSelectedImage] = useState<{
    url: string
    file: File
    type: 'avatar'
  } | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(text.profile.selectImageError)
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage({ url: reader.result as string, file, type: 'avatar' })
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    }
  }

  const handleCropConfirm = async (data: {
    percent: { x: number; y: number; width: number; height: number }
    pixels: { x: number; y: number; width: number; height: number }
    zoom: number
  }) => {
    if (!selectedImage) return

    const formData = new FormData()

    try {
      const croppedBlob = await getCroppedImg(selectedImage.url, data.pixels)
      if (!croppedBlob) return

      formData.append('file', croppedBlob, 'avatar.jpg')
      updateAvatarMutation.mutate(formData, {
        onSuccess: () => {
          toast.success(text.profile.updateAvatarSuccess)
          setSelectedImage(null)
        }
      })
    } catch (e) {
      console.error('Crop failed', e)
      toast.error(text.profile.selectImageError)
    }
  }

  if (user.active === false) {
    return (
      <DeactivatedProfileState
        user={user}
        isOwner={true}
        onGoToSettings={() => {
          window.location.href = '/settings'
        }}
      />
    )
  }

  return (
    <>
      <ProfileInfoBase
        user={user}
        cover={<BackgroundEditor backgroundUrl={user.background} backgroundY={user.backgroundY} />}
        avatar={
          <div className='relative'>
            <div className='rounded-full border-4 border-background bg-background shadow-[0_4px_16px_rgba(0,0,0,0.12)] w-20 h-20 overflow-hidden relative'>
              <UserAvatar
                src={user.avatar}
                name={user.fullName}
                className='w-full h-full cursor-pointer'
                fallbackClassName='text-2xl font-bold'
              />
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className='absolute bottom-0 right-0.5 p-1.5 bg-background border border-border rounded-full hover:bg-muted transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.15)] cursor-pointer z-10'
            >
              <Camera className='w-4 h-4 text-muted-foreground' />
            </button>
            <input
              type='file'
              ref={avatarInputRef}
              className='hidden'
              accept='image/png, image/jpeg, image/jpg, image/webp'
              onChange={handleAvatarChange}
            />
          </div>
        }
        nameActions={
          <button onClick={onEdit} className='p-1 hover:bg-muted rounded-md transition-colors cursor-pointer shrink-0'>
            <Pencil className='w-4 h-4 text-muted-foreground' />
          </button>
        }
        showPrivacyNote={true}
        footer={
          <div className='mt-auto border-t border-border sticky bottom-0 bg-background shrink-0'>
            <Button
              onClick={onEdit}
              variant='ghost'
              className='w-full h-11 bg-background hover:bg-muted border-none font-bold text-sm rounded-none gap-2 transition-colors cursor-pointer text-foreground'
            >
              <Pencil className='w-4 h-4' />
              {text.profile.update}
            </Button>
          </div>
        }
      />

      {selectedImage && (
        <UpdateImageDialog
          image={selectedImage.url}
          type={selectedImage.type}
          title={text.profile.updateAvatarTitle}
          confirmText={text.profile.confirm}
          cancelText={text.profile.cancel}
          dragToMoveText={text.profile.dragToMove}
          onConfirm={handleCropConfirm}
          onCancel={() => setSelectedImage(null)}
        />
      )}
    </>
  )
}
