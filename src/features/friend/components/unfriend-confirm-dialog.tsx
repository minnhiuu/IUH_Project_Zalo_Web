import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useFriendText } from '../i18n/use-friend-text'

interface UnfriendConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  onConfirm: () => void
  isPending?: boolean
}

export function UnfriendConfirmDialog({
  open,
  onOpenChange,
  userName,
  onConfirm,
  isPending = false
}: UnfriendConfirmDialogProps) {
  const { text } = useFriendText()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size='sm'>
        <AlertDialogHeader>
          <AlertDialogTitle>{text.dialogs.unfriendConfirm.title}</AlertDialogTitle>
          <AlertDialogDescription>{text.dialogs.unfriendConfirm.description(userName)}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{text.dialogs.unfriendConfirm.cancel}</AlertDialogCancel>
          <AlertDialogAction
            variant='destructive'
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
          >
            {isPending ? text.loading : text.dialogs.unfriendConfirm.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
