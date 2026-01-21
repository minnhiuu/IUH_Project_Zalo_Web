import * as React from 'react'
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
import { useAuthContext, useLogoutMutation } from '@/features/auth'
import { useNavigate } from 'react-router'
import { PATHS } from '@/constants/path'
import { handleErrorApi } from '@/utils/error-handler'
import { FullScreenLoading } from '@/components/common/full-screen-loading'

interface LogoutConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending?: boolean
}

export function LogoutConfirmDialog({ open, onOpenChange }: LogoutConfirmDialogProps) {
  const { logoutLocal } = useAuthContext()
  const logoutMutation = useLogoutMutation()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logoutMutation.mutateAsync(undefined)
    } catch (error) {
      handleErrorApi({ error })
      setIsLoggingOut(false)
    } finally {
      setTimeout(() => {
        logoutLocal()
        navigate(PATHS.AUTH.LOGIN)
      }, 800)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        {isLoggingOut && <FullScreenLoading />}
        <AlertDialogOverlay className='bg-black/45 backdrop-blur-none! duration-200 fixed inset-0 z-50' />
        <AlertDialogContent
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-[310px] max-w-[95vw] p-0 gap-0 rounded-[4px] overflow-hidden border-none shadow-2xl bg-white outline-none',
            'animate-in zoom-in-95 duration-200'
          )}
        >
          <div className='flex items-center justify-between px-4 h-[44px] border-b border-border'>
            <h2 className='text-[15px] font-bold text-foreground'>Xác nhận</h2>
            <button
              onClick={() => onOpenChange(false)}
              className='p-1 hover:bg-black/5 rounded-full transition-colors outline-none cursor-pointer'
            >
              <X className='w-5 h-5 text-muted-foreground' />
            </button>
          </div>

          <div className='p-4 py-5'>
            <p className='text-[15px] text-foreground font-normal leading-normal text-center'>
              Bạn có muốn đăng xuất khỏi BondHub?
            </p>
          </div>

          <div className='flex flex-row justify-end gap-2 px-4 pb-4'>
            <AlertDialogCancel asChild>
              <Button
                variant='secondary'
                className='bg-muted hover:bg-border text-foreground font-bold h-[36px] px-5 rounded-[3px] border-none shadow-none text-[14px] mt-0 flex-1'
              >
                Không
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className='bg-primary hover:bg-primary-hover text-white font-bold h-[36px] px-5 rounded-[3px] border-none shadow-none text-[14px] flex-1'
              >
                {isLoggingOut ? 'Đang xử lý...' : 'Đăng xuất'}
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
