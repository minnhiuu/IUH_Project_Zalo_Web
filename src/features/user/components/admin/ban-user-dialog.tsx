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
import { useAdminText } from '@/features/user/i18n/use-admin-text'

type BanUserDialogProps = {
  item: AdminUserListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BanUserDialog({ item, open, onOpenChange }: BanUserDialogProps) {
  const [reason, setReason] = useState('')
  const { text } = useAdminText()
  const t = text.userManagement

  const banMutation = useBanUserMutation()

  const handleBan = () => {
    if (!item) return
    if (!reason.trim()) {
      toast.error(t.banDialog.reasonRequired)
      return
    }

    banMutation.mutate(
      { userId: item.user.id, data: { reason: reason.trim() } },
      {
        onSuccess: () => {
          toast.success(t.banDialog.success(item.user.fullName))
          onOpenChange(false)
          setReason('')
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
            {t.banDialog.title}
          </DialogTitle>
          <DialogDescription>
            {t.banDialog.description} <strong>{item?.user.fullName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='reason'>
              {t.banDialog.reason} <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='reason'
              placeholder={t.banDialog.reasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t.banDialog.cancel}
          </Button>
          <Button variant='destructive' onClick={handleBan} disabled={banMutation.isPending}>
            {banMutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
            {t.banDialog.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
