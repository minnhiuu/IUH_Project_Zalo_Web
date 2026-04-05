import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  headerLeft?: React.ReactNode
  description?: string
  children?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  isPending?: boolean
  variant?: 'danger' | 'primary'
  className?: string
  noContentPadding?: boolean
}

export function BaseDialog({
  open,
  onOpenChange,
  title,
  headerLeft,
  description,
  children,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isPending,
  variant = 'primary',
  className,
  noContentPadding = false
}: BaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className='bg-black/45 backdrop-blur-none! duration-200 fixed inset-0 z-50' />
        <DialogContent
          showCloseButton={false}
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-100 max-w-[95vw] p-0 gap-0 rounded-md overflow-hidden border border-border shadow-2xl bg-background outline-none',
            'animate-in zoom-in-95 duration-200',
            className
          )}
        >
          <div className='flex items-center justify-between px-4 h-11 border-b border-border'>
            <div className='flex items-center min-w-0 gap-1'>
              {headerLeft}
              <DialogTitle className='text-[15px] font-bold text-foreground truncate mr-2'>{title}</DialogTitle>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className='p-1 hover:bg-muted rounded-full transition-colors outline-none cursor-pointer'
            >
              <X className='w-5 h-5 text-muted-foreground' />
            </button>
          </div>

          <div className={cn(!noContentPadding && 'p-4 pt-5 pb-5')}>
            {description && (
              <DialogDescription className='text-[14.5px] text-foreground font-normal leading-normal px-4'>
                {description}
              </DialogDescription>
            )}
            {children}
          </div>

          {(confirmText || cancelText) && (
            <DialogFooter className='flex flex-row justify-end gap-3 px-4 pb-4'>
              {cancelText && (
                <Button
                  variant='secondary'
                  onClick={() => {
                    if (onCancel) {
                      onCancel()
                    } else {
                      onOpenChange(false)
                    }
                  }}
                  className='px-6 h-9 min-w-20'
                >
                  {cancelText}
                </Button>
              )}
              {confirmText && (
                <Button
                  variant={variant === 'danger' ? 'destructive' : 'default'}
                  onClick={onConfirm}
                  disabled={isPending}
                  className='px-6 h-9 min-w-20'
                >
                  {isPending ? '...' : confirmText}
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
