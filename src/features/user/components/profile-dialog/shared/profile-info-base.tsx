import { formatDate } from '@/utils/date'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { useLocale } from '@/lib/i18n'
import { GENDER_LABELS } from '@/constants'
import { type UserResponse } from '@/features/user/schemas/user.schema'
import { Separator } from '@/components/ui/separator'

interface ProfileInfoBaseProps {
  user: UserResponse
  cover: React.ReactNode
  avatar: React.ReactNode
  nameActions?: React.ReactNode
  contentBeforeInfo?: React.ReactNode
  footer?: React.ReactNode
  showPrivacyNote?: boolean
}

export function ProfileInfoBase({
  user,
  cover,
  avatar,
  nameActions,
  contentBeforeInfo,
  footer,
  showPrivacyNote
}: ProfileInfoBaseProps) {
  const { text } = useUserText()
  const { locale } = useLocale()
  const formattedDob = formatDate(user.dob, locale, 'dd MMMM, yyyy')

  return (
    <div className='flex-1 overflow-y-auto custom-scrollbar bg-background flex flex-col overflow-x-hidden'>
      <div className='shrink-0 h-[160px] relative w-full'>{cover}</div>

      <div className='relative px-4 bg-background'>
        <div className='flex items-end gap-3 -translate-y-6 mb-[-16px]'>
          <div className='relative shrink-0 flex items-center justify-center'>{avatar}</div>

          <div className='pb-4 flex flex-col min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <h3 className='text-[17px] font-bold text-foreground truncate'>{user.fullName}</h3>
              {nameActions}
            </div>
          </div>
        </div>

        {contentBeforeInfo}
      </div>

      <Separator className='h-2 bg-section-divider border-none shrink-0 mt-1' />

      <div className='flex flex-col px-4 py-6 space-y-6'>
        <h4 className='text-[15px] font-bold text-foreground'>{text.profile.personalInfo}</h4>

        <div className='space-y-4 pr-1'>
          <div className='flex text-[14px] items-start'>
            <span className='w-28 shrink-0 text-muted-foreground'>{text.profile.bioLabel}</span>
            <span className='text-foreground wrap-break-words flex-1'>{user.bio || text.profile.noBio}</span>
          </div>

          <div className='flex text-[14.5px] items-start'>
            <span className='w-28 shrink-0 text-muted-foreground'>{text.profile.gender}</span>
            <span className='text-foreground font-medium'>
              {user.gender != null ? GENDER_LABELS[user.gender] : '--'}
            </span>
          </div>

          <div className='flex text-[14.5px] items-start'>
            <span className='w-28 shrink-0 text-muted-foreground'>{text.profile.dob}</span>
            <span className='text-foreground font-medium'>{user.dob ? formattedDob : '--'}</span>
          </div>

          <div className='flex text-[14.5px] items-start'>
            <span className='w-28 shrink-0 text-muted-foreground'>{text.profile.phone}</span>
            <span className='text-foreground font-medium'>{user.phoneNumber || '--'}</span>
          </div>

          {showPrivacyNote && (
            <p className='mt-6 text-[12.5px] text-muted-foreground leading-relaxed italic opacity-80'>
              {text.profile.privacyNote}
            </p>
          )}
        </div>
      </div>

      {footer}
    </div>
  )
}
