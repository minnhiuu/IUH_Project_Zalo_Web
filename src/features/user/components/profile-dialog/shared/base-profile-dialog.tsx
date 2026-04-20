import { X, ChevronLeft } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface BaseProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onBack?: () => void
  children: React.ReactNode
  className?: string
}

export function BaseProfileDialog({ open, onOpenChange, title, onBack, children, className }: BaseProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName='backdrop-blur-none! duration-200 bg-transparent'
        className={cn(
          'w-[400px] max-w-[95vw] max-h-[90vh] p-0 gap-0 rounded overflow-hidden border-none shadow-[0_8px_28px_rgba(0,0,0,0.15)] bg-background outline-none flex flex-col',
          'animate-in zoom-in-95 duration-200',
          className
        )}
      >
          <div className='flex items-center justify-between px-4 h-11 border-b border-border bg-background sticky top-0 z-10 shrink-0'>
            <div className='flex items-center gap-2'>
              {onBack && (
                <button
                  onClick={onBack}
                  className='p-1 hover:bg-secondary-hover rounded-full transition-colors outline-none cursor-pointer'
                >
                  <ChevronLeft className='w-5 h-5 text-muted-foreground' />
                </button>
              )}
              <h2 className='text-base font-bold text-foreground'>{title}</h2>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className='p-1 hover:bg-secondary-hover rounded-full transition-colors outline-none cursor-pointer'
            >
              <X className='w-5 h-5 text-muted-foreground' />
            </button>
          </div>
          <div className='flex-1 overflow-hidden bg-background relative flex flex-col'>{children}</div>
      </DialogContent>
    </Dialog>
  )
}
