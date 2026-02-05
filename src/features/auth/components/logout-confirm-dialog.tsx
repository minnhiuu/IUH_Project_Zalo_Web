import { X } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogPortal
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useAuthContext } from '../context/auth-context'
import { useLogoutMutation } from '../queries/use-mutations'
import { useNavigate } from 'react-router'
import { PATHS } from '@/constants/path'
import { handleErrorApi } from '@/utils/error-handler'
import { FullScreenLoading } from '@/components/common/full-screen-loading'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'
import { useCommonText } from '@/locales/common/use-common-text'

interface LogoutConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending?: boolean
}

export function LogoutConfirmDialog({ open, onOpenChange }: LogoutConfirmDialogProps) {
  const { logoutLocal } = useAuthContext()
  const logoutMutation = useLogoutMutation()
  const navigate = useNavigate()
  const { text } = useAuthText()
  const { text: commonText } = useCommonText()

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync(undefined)
      logoutLocal()
      navigate(PATHS.AUTH.LOGIN)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const isPending = logoutMutation.isPending

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        {isPending && <FullScreenLoading message={commonText.pleaseWait} />}
        <AlertDialogOverlay className='bg-black/45 backdrop-blur-none! duration-200 fixed inset-0 z-50' />
        <AlertDialogContent
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-[374px] max-w-[95vw] p-0 gap-0 rounded-md overflow-hidden border border-border shadow-2xl bg-background outline-none',
            'animate-in zoom-in-95 duration-200'
          )}
        >
          <div className='flex items-center justify-between px-4 h-11 border-b border-border'>
            <h2 className='text-[15px] font-bold text-foreground'>{text.logoutDialog.title}</h2>
            <button
              onClick={() => onOpenChange(false)}
              className='p-1 hover:bg-secondary-hover rounded-full transition-colors outline-none cursor-pointer'
            >
              <X className='w-5 h-5 text-muted-foreground' />
            </button>
          </div>

          <div className='p-4 pt-5 pb-5'>
            <p className='text-[15px] text-foreground font-normal leading-normal'>{text.logoutDialog.confirmMessage}</p>
          </div>

          <div className='flex flex-row justify-end gap-3 px-4 pb-4'>
            <AlertDialogCancel variant='secondary'>{text.logoutDialog.no}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>{text.logoutDialog.yes}</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
