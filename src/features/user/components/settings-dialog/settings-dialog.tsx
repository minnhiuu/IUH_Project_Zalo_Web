import { X } from 'lucide-react'
import { AlertDialog, AlertDialogContent, AlertDialogOverlay, AlertDialogPortal } from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { SettingsContent } from './settings-content'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { text } = useUserText()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay className='bg-black/45 backdrop-blur-none! duration-200 fixed inset-0 z-50' />
        <AlertDialogContent
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-[95vw] md:w-[92vw] lg:w-[88vw] xl:w-[1400px] max-w-[1600px]',
            'h-[90vh] md:h-[85vh] lg:h-[80vh] max-h-[800px]',
            'p-0 gap-0 rounded-[4px] border-none shadow-[0_8px_28px_rgba(0,0,0,0.15)] bg-background outline-none',
            'animate-in zoom-in-95 duration-200',
            'flex flex-col'
          )}
        >
          <div className='flex items-center justify-between px-4 h-[44px] flex-shrink-0 border-b border-border bg-background'>
            <h2 className='text-[15px] font-bold text-foreground'>{text.settings.title}</h2>
            <button
              onClick={() => onOpenChange(false)}
              className='p-1 hover:bg-black/5 rounded-full transition-colors outline-none cursor-pointer'
            >
              <X className='w-5 h-5 text-muted-foreground' />
            </button>
          </div>

          <div className='flex-1 overflow-hidden bg-background'>
            <SettingsContent />
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
