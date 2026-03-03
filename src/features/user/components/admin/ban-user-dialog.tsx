import { useState } from 'react'
import { Ban, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useBanUserMutation } from '@/features/user/queries/admin-mutations'
import { toast } from 'sonner'
import type { AdminUserListItem } from '@/features/user/schemas/admin-user.schema'

type BanUserDialogProps = {
  item: AdminUserListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BanUserDialog({ item, open, onOpenChange }: BanUserDialogProps) {
  const [reason, setReason] = useState('')

  const banMutation = useBanUserMutation()

  const handleBan = () => {
    if (!item) return
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do cấm')
      return
    }

    banMutation.mutate(
      { userId: item.user.id, data: { reason: reason.trim() } },
      {
        onSuccess: () => {
          toast.success(`Đã cấm người dùng ${item.user.fullName}`)
          onOpenChange(false)
          setReason('')
        },
        onError: () => {
          toast.error('Không thể cấm người dùng')
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-destructive'>
            <Ban className='w-5 h-5' />
            Cấm người dùng
          </DialogTitle>
          <DialogDescription>
            Bạn đang cấm người dùng <strong>{item?.user.fullName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='reason'>
              Lý do cấm <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='reason'
              placeholder='Nhập lý do cấm người dùng...'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant='destructive' onClick={handleBan} disabled={banMutation.isPending}>
            {banMutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
            Xác nhận cấm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
