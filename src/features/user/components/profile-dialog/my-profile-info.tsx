import { Camera, Pencil } from 'lucide-react'
import { formatDate } from '@/utils/date'
import { Button } from '@/components/ui/button'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { useLocale } from '@/lib/i18n'
import { Gender } from '@/constants'
import { UserAvatar } from '@/components/common/user-avatar'
import { useAuthContext } from '@/features/auth/context/auth-context'

interface MyProfileInfoProps {
  user: NonNullable<ReturnType<typeof useAuthContext>['user']>
  onEdit: () => void
}

export function MyProfileInfo({ user, onEdit }: MyProfileInfoProps) {
  const { text } = useUserText()
  const { locale } = useLocale()
  const formattedDob = formatDate(user.dob, locale, 'dd MMMM, yyyy')

  return (
    <>
      <div className='relative h-[160px] w-full bg-muted overflow-hidden cursor-pointer'>
        {user.background && <img src={user.background} alt='Cover' className='w-full h-full object-cover' />}
        {!user.background && (
          <div className='w-full h-full bg-linear-to-r from-primary to-primary-hover flex items-center justify-center'></div>
        )}
      </div>

      <div className='px-4 relative h-[84px] bg-background'>
        <div className='absolute -top-6 left-4 flex items-end gap-4'>
          <div className='relative group shrink-0'>
            <UserAvatar
              src={user.avatar}
              name={user.fullName}
              className='w-20 h-20 border-2 border-background shadow-sm cursor-pointer'
              fallbackClassName='text-3xl bg-primary text-white font-medium'
            />
            <button className='absolute bottom-0 right-0 p-1.5 bg-background border border-border rounded-full hover:bg-muted transition-colors shadow-sm cursor-pointer'>
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
            {user.bio && <p className='text-[13px] text-muted-foreground line-clamp-1 max-w-[250px]'>{user.bio}</p>}
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

          {user.bio && (
            <div className='flex items-start'>
              <span className='w-28 shrink-0 text-[14px] text-muted-foreground'>{text.profile.bioLabel}</span>
              <span className='text-[14px] text-foreground font-medium wrap-break-word'>{user.bio}</span>
            </div>
          )}

          <div className='flex items-start'>
            <span className='w-28 shrink-0 text-[14px] text-muted-foreground'>{text.profile.dob}</span>
            <span className='text-[14px] text-foreground font-medium'>{formattedDob}</span>
          </div>

          <div className='flex flex-col gap-1'>
            <div className='flex items-start'>
              <span className='w-28 shrink-0 text-[14px] text-muted-foreground'>{text.profile.phone}</span>
              <span className='text-[14px] text-foreground font-medium'>{user.phoneNumber}</span>
            </div>
            <p className='mt-5 text-[12.5px] text-muted-foreground leading-snug'>{text.profile.privacyNote}</p>
          </div>
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
