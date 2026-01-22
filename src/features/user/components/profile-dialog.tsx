import { useEffect } from 'react'
import { X, Camera, Pencil } from 'lucide-react'
import { formatDate } from '@/utils/date'

import { AlertDialog, AlertDialogContent, AlertDialogOverlay, AlertDialogPortal } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { useLocale } from '@/lib/i18n'
import { Gender } from '@/constants'
import { UserAvatar } from '@/components/common/user-avatar'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, refetchUser } = useAuthContext()
  const { text } = useUserText()
  const { locale } = useLocale()

  useEffect(() => {
    if (open) {
      refetchUser()
    }
  }, [open, refetchUser])

  if (!user) return null

  const formattedDob = formatDate(user.dob, locale, 'dd MMMM, yyyy')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay className='bg-black/45 backdrop-blur-none! duration-200 fixed inset-0 z-50' />
        <AlertDialogContent
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-[400px] max-w-[95vw] p-0 gap-0 rounded-[4px] overflow-hidden border-none shadow-[0_8px_28px_rgba(0,0,0,0.15)] bg-background outline-none',
            'animate-in zoom-in-95 duration-200'
          )}
        >
          <div className='flex items-center justify-between px-4 h-[44px] border-b border-border bg-background sticky top-0 z-10'>
            <h2 className='text-[15px] font-bold text-foreground'>{text.profile.title}</h2>
            <button
              onClick={() => onOpenChange(false)}
              className='p-1 hover:bg-black/5 rounded-full transition-colors outline-none cursor-pointer'
            >
              <X className='w-5 h-5 text-muted-foreground' />
            </button>
          </div>

          <div className='overflow-y-auto max-h-[calc(90vh-44px)] bg-background'>
            <div className='relative h-[160px] w-full bg-muted overflow-hidden cursor-pointer'>
              <img
                src={user.background || 'https://cover-talk.zadn.vn/d/8/c/a/8/ddaacb12a8db4ca28bebf0102d217494.jpg'}
                alt='Cover'
                className='w-full h-full object-cover'
              />
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
                <div className='pb-2 flex items-center gap-2 min-w-0'>
                  <h3 className='text-[18px] font-bold text-foreground truncate max-w-[200px]'>{user.fullName}</h3>
                  <button className='p-1 hover:bg-muted rounded-md transition-colors cursor-pointer shrink-0'>
                    <Pencil className='w-4 h-4 text-muted-foreground/60' />
                  </button>
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
                    {user.gender === Gender.Male ? text.profile.male : text.profile.female}
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
                  <p className='mt-5 text-[12.5px] text-muted-foreground leading-snug'>{text.profile.privacyNote}</p>
                </div>
              </div>

              <div className='mt-8 border-t border-border flex justify-center'>
                <Button
                  variant='ghost'
                  className='w-full h-10 bg-background hover:bg-muted border-none font-bold text-[14px] gap-2 transition-colors'
                >
                  <Pencil className='w-4 h-4' />
                  {text.profile.update}
                </Button>
              </div>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
