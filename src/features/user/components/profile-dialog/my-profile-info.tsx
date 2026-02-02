import { useRef } from 'react'
import { Camera, Pencil } from 'lucide-react'
import { formatDate } from '@/utils/date'
import { Button } from '@/components/ui/button'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { useLocale } from '@/lib/i18n'
import { Gender } from '@/constants'
import { UserAvatar } from '@/components/common/user-avatar'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { useUpdateAvatarMutation, useUpdateBackgroundMutation } from '../../queries/use-mutations'
import { toast } from 'sonner'

interface MyProfileInfoProps {
  user: NonNullable<ReturnType<typeof useAuthContext>['user']>
  onEdit: () => void
}

export function MyProfileInfo({ user, onEdit }: MyProfileInfoProps) {
  const { text } = useUserText()
  const { locale } = useLocale()
  const formattedDob = formatDate(user.dob, locale, 'dd MMMM, yyyy')

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)

  const updateAvatarMutation = useUpdateAvatarMutation()
  const updateBackgroundMutation = useUpdateBackgroundMutation()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(text.profile.selectImageError)
        return
      }
      const formData = new FormData()
      formData.append('file', file)
      updateAvatarMutation.mutate(formData, {
        onSuccess: () => toast.success(text.profile.updateAvatarSuccess)
      })
    }
  }

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(text.profile.selectImageError)
        return
      }
      const formData = new FormData()
      formData.append('file', file)
      updateBackgroundMutation.mutate(formData, {
        onSuccess: () => toast.success(text.profile.updateBackgroundSuccess)
      })
    }
  }

  return (
    <>
      <div className='relative h-[160px] w-full bg-muted overflow-hidden group'>
        {user.background && <img src={user.background} alt='Cover' className='w-full h-full object-cover' />}
        {!user.background && (
          <div className='w-full h-full bg-linear-to-r from-primary to-primary-hover flex items-center justify-center'></div>
        )}
        <input
          type='file'
          ref={bgInputRef}
          className='hidden'
          accept='image/png, image/jpeg, image/jpg, image/webp'
          onChange={handleBackgroundChange}
        />
        <button
          onClick={() => bgInputRef.current?.click()}
          className='absolute top-2 right-2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all cursor-pointer backdrop-blur-sm'
        >
          <Camera className='w-5 h-5' />
        </button>
      </div>

      <div className='px-4 relative h-[84px] bg-background'>
        <div className='absolute -top-6 left-4 flex items-end gap-4'>
          <div className='relative shrink-0'>
            <UserAvatar
              src={user.avatar}
              name={user.fullName}
              className='w-20 h-20 border-2 border-background shadow-sm cursor-pointer'
              fallbackClassName='text-3xl bg-primary text-white font-medium'
            />
            <input
              type='file'
              ref={avatarInputRef}
              className='hidden'
              accept='image/png, image/jpeg, image/jpg, image/webp'
              onChange={handleAvatarChange}
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              className='absolute bottom-0 right-0 p-1.5 bg-background border border-border rounded-full hover:bg-muted transition-colors shadow-sm cursor-pointer'
            >
              <Camera className='w-4 h-4 text-foreground' />
            </button>
          </div>
          <div className='pb-2 flex flex-col min-w-0'>
            <div className='flex items-center gap-2'>
              <h3 className='text-[18px] font-bold text-foreground truncate max-w-[200px]'>{user.fullName}</h3>
              <button
                onClick={onEdit}
                className='p-1 hover:bg-muted rounded-md transition-colors cursor-pointer shrink-0'
              >
                <Pencil className='w-4 h-4 text-muted-foreground/60' />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='h-2 bg-muted w-full' />

      <div className='px-4 pt-4'>
        <h4 className='text-[15px] font-bold text-foreground mb-5'>{text.profile.personalInfo}</h4>

        <div className='space-y-4 pr-2'>
          <div className='flex items-start'>
            <span className='w-28 shrink-0 text-[14px] text-muted-foreground'>{text.profile.gender}</span>
            <span className='text-[14px] text-foreground font-medium'>
              {user.gender && (user.gender === Gender.Male ? text.profile.male : text.profile.female)}
            </span>
          </div>

          <div className='flex items-start'>
            <span className='w-28 shrink-0 text-[14px] text-muted-foreground'>{text.profile.dob}</span>
            <span className='text-[14px] text-foreground font-medium'>{formattedDob}</span>
          </div>

          <div className='flex flex-col gap-1'>
            <div className='flex items-start'>
              <span className='w-28 shrink-0 text-[14px] text-muted-foreground'>{text.profile.phone}</span>
              <span className='text-[14px] text-foreground font-medium'>{user.phoneNumber}</span>
            </div>
          </div>
          {user.bio && (
            <div className='flex items-start'>
              <span className='w-28 shrink-0 text-[14px] text-muted-foreground'>{text.profile.bioLabel}</span>
              <span className='text-[14px] text-foreground font-medium wrap-break-word'>{user.bio}</span>
            </div>
          )}
          <p className='mt-5 text-[12.5px] text-muted-foreground leading-snug'>{text.profile.privacyNote}</p>
        </div>

        <div className='mt-8 border-t border-border flex justify-center'>
          <Button
            onClick={onEdit}
            variant='ghost'
            className='w-full h-10 bg-background hover:bg-muted border-none font-bold text-[14px] gap-2 transition-colors'
          >
            <Pencil className='w-4 h-4' />
            {text.profile.update}
          </Button>
        </div>
      </div>
    </>
  )
}
