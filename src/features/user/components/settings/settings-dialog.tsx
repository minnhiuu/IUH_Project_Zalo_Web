import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='!max-w-[70vw] w-[70vw] h-[90vh] p-0 gap-0 overflow-hidden' showCloseButton={false}>
        <div className='flex h-full overflow-hidden'>
          <div className='flex-1 overflow-y-auto bg-background'>
            <div className='p-8'>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
