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

type UnbanUserDialogProps = {
  item: AdminUserListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnbanUserDialog({ item, open, onOpenChange }: UnbanUserDialogProps) {
  const unbanMutation = useUnbanUserMutation()

  const handleUnban = () => {
    if (!item) return

    unbanMutation.mutate(item.user.id, {
      onSuccess: () => {
        toast.success(`Đã bỏ cấm người dùng ${item.user.fullName}`)
        onOpenChange(false)
      },
      onError: () => {
        toast.error('Không thể bỏ cấm người dùng')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-green-600'>
            <ShieldCheck className='w-5 h-5' />
            Bỏ cấm người dùng
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn bỏ cấm người dùng <strong>{item?.user.fullName}</strong>?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleUnban} disabled={unbanMutation.isPending} className='bg-green-600 hover:bg-green-700'>
            {unbanMutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
            Xác nhận bỏ cấm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
