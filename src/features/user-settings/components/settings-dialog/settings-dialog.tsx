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
        <AlertDialogOverlay className='bg-foreground/45 backdrop-blur-none! duration-200 fixed inset-0 z-50' />
        <AlertDialogContent
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-[94vw]! max-w-[94vw]! h-[82vh]!',
            'sm:w-130! sm:max-w-130! sm:h-140!',
            'md:w-175! md:max-w-175! md:h-155!',
            'lg:w-230! lg:max-w-230! lg:h-175!',
            'xl:w-260! xl:max-w-260! xl:h-190!',
            'p-0 gap-0 rounded-lg border border-border shadow-[0_8px_28px_rgba(0,0,0,0.15)] bg-card text-card-foreground outline-none',
            'animate-in zoom-in-95 duration-200',
            'flex flex-col'
          )}
        >
          <div className='flex items-center justify-between px-4 h-11 shrink-0 border-b border-border bg-card'>
            <h2 className='text-[15px] font-bold text-foreground'>{text.settings.title}</h2>
            <button
              onClick={() => onOpenChange(false)}
              className='p-1 hover:bg-accent rounded-full transition-colors outline-none cursor-pointer'
            >
              <X className='w-5 h-5 text-muted-foreground' />
            </button>
          </div>

          <div className='flex-1 overflow-hidden bg-muted'>
            <SettingsContent />
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
