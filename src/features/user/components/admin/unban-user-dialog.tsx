import { ShieldCheck, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useUnbanUserMutation } from '@/features/user/queries/admin-mutations'
import { toast } from 'sonner'
import type { AdminUserListItem } from '@/features/user/schemas/admin-user.schema'
import { useAdminText } from '@/features/user/i18n/use-admin-text'

type UnbanUserDialogProps = {
  item: AdminUserListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnbanUserDialog({ item, open, onOpenChange }: UnbanUserDialogProps) {
  const { text } = useAdminText()
  const t = text.userManagement

  const unbanMutation = useUnbanUserMutation()

  const handleUnban = () => {
    if (!item) return

    unbanMutation.mutate(item.user.id, {
      onSuccess: () => {
        toast.success(t.unbanDialog.success(item.user.fullName))
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-green-600'>
            <ShieldCheck className='w-5 h-5' />
            {t.unbanDialog.title}
          </DialogTitle>
          <DialogDescription>
            {t.unbanDialog.description} <strong>{item?.user.fullName}</strong>?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t.unbanDialog.cancel}
          </Button>
          <Button onClick={handleUnban} disabled={unbanMutation.isPending} className='bg-green-600 hover:bg-green-700'>
            {unbanMutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
            {t.unbanDialog.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
