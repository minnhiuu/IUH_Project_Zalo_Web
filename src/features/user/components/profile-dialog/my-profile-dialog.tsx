import { useState } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import { AlertDialog, AlertDialogContent, AlertDialogOverlay, AlertDialogPortal } from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { MyProfileInfo } from './my-profile-info'
import { MyProfileEditForm } from './my-profile-edit-form'
import { useMyProfile } from '../../queries/use-queries'

interface MyProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MyProfileDialog({ open, onOpenChange }: MyProfileDialogProps) {
  const { user: authUser } = useAuthContext()
  const { data: profileRes } = useMyProfile()
  const { text } = useUserText()
  const [isEditing, setIsEditing] = useState(false)

  const user = profileRes?.data || authUser

  if (!user) return null

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsEditing(false)
    }
    onOpenChange(newOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
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
            <div className='flex items-center gap-2'>
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className='p-1 hover:bg-black/5 rounded-full transition-colors outline-none cursor-pointer'
                >
                  <ChevronLeft className='w-5 h-5 text-muted-foreground' />
                </button>
              )}
              <h2 className='text-[15px] font-bold text-foreground'>
                {isEditing ? text.profile.editTitle : text.profile.title}
              </h2>
            </div>
            <button
              onClick={() => handleOpenChange(false)}
              className='p-1 hover:bg-black/5 rounded-full transition-colors outline-none cursor-pointer'
            >
              <X className='w-5 h-5 text-muted-foreground' />
            </button>
          </div>

          <div className='overflow-y-auto max-h-[calc(90vh-44px)] bg-background'>
            {!isEditing ? (
              <MyProfileInfo user={user} onEdit={() => setIsEditing(true)} />
            ) : (
              <MyProfileEditForm user={user} onCancel={() => setIsEditing(false)} />
            )}
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
