import { X } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogPortal
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthContext } from '../context/auth-context'
import { useLogoutMutation } from '../queries/use-mutations'
import { useNavigate } from 'react-router'
import { PATHS } from '@/constants/path'
import { handleErrorApi } from '@/utils/error-handler'
import { FullScreenLoading } from '@/components/common/full-screen-loading'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'
import { useTranslation } from 'react-i18next'

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
  const { t: tCommon } = useTranslation('common')

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
        {isPending && <FullScreenLoading message={tCommon('pleaseWait')} />}
        <AlertDialogOverlay className='bg-black/45 backdrop-blur-none! duration-200 fixed inset-0 z-50' />
        <AlertDialogContent
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-[374px] max-w-[95vw] p-0 gap-0 rounded-[4px] overflow-hidden border-none shadow-2xl bg-white outline-none',
            'animate-in zoom-in-95 duration-200'
          )}
        >
          <div className='flex items-center justify-between px-4 h-[44px] border-b border-border'>
            <h2 className='text-[15px] font-bold text-foreground'>{text.logoutDialog.title}</h2>
            <button
              onClick={() => onOpenChange(false)}
              className='p-1 hover:bg-black/5 rounded-full transition-colors outline-none cursor-pointer'
            >
              <X className='w-5 h-5 text-muted-foreground' />
            </button>
          </div>

          <div className='p-4 pt-5 pb-4 mb-5'>
            <p className='text-[15px] text-foreground font-normal leading-normal'>{text.logoutDialog.confirmMessage}</p>
          </div>

          <div className='flex flex-row justify-end gap-2 px-4 pb-4'>
            <AlertDialogCancel asChild>
              <Button
                variant='secondary'
                className='bg-muted hover:bg-border text-foreground font-bold h-[36px] px-4 min-w-[80px] rounded-[3px] border-none shadow-none text-[14px] mt-0'
              >
                {text.logoutDialog.no}
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleLogout}
                className='font-bold h-[36px] px-4 min-w-[100px] rounded-[3px] border-none shadow-none text-[14px]'
              >
                {text.logoutDialog.yes}
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
