import { Loader2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ConversationHistoryConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  isPending?: boolean
  destructive?: boolean
}

export function ConversationHistoryConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  isPending,
  destructive = false
}: ConversationHistoryConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className='bg-black/45 backdrop-blur-none! duration-200 fixed inset-0 z-50' />
        <DialogContent
          showCloseButton={false}
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-60',
            'w-[374px] max-w-[95vw] p-0 gap-0 rounded-md overflow-hidden border border-border shadow-2xl bg-background outline-none',
            'animate-in zoom-in-95 duration-200'
          )}
        >
          <div className='flex items-center justify-between px-4 h-11 border-b border-border'>
            <h2 className='text-[15px] font-bold text-foreground'>{title}</h2>
            <button
              onClick={() => onOpenChange(false)}
              className='p-1 hover:bg-secondary-hover rounded-full transition-colors outline-none cursor-pointer'
            >
              <X className='w-5 h-5 text-muted-foreground' />
            </button>
          </div>

          <div className='p-4 pt-5 pb-5'>
            <p className='text-[15px] text-foreground font-normal leading-normal'>{description}</p>
          </div>

          <DialogFooter className='flex flex-row justify-end gap-3 px-4 pb-4'>
            <Button variant='secondary' onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button variant={destructive ? 'destructive' : 'default'} onClick={onConfirm} disabled={isPending}>
              {isPending ? <Loader2 className='w-4 h-4 animate-spin' /> : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
