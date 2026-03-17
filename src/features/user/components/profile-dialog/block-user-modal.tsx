import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { blockApi } from '@/features/user/api/block.api'
import { blockKeys, userKeys } from '@/features/user/queries/keys'
import { toast } from 'sonner'
import { Ban, MessageSquare, Phone, Camera } from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'

interface BlockUserModalProps {
  userId: string
  userName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  isBlocked?: boolean
  currentPreference?: {
    message: boolean
    call: boolean
    story: boolean
  }
}

export function BlockUserModal({
  userId,
  userName,
  open,
  onOpenChange,
  isBlocked = false,
  currentPreference
}: BlockUserModalProps) {
  const { text } = useUserText()
  const [blockMessage, setBlockMessage] = useState(isBlocked ? (currentPreference?.message ?? false) : false)
  const [blockCall, setBlockCall] = useState(isBlocked ? (currentPreference?.call ?? false) : false)
  const [blockStory, setBlockStory] = useState(isBlocked ? (currentPreference?.story ?? false) : false)
  const queryClient = useQueryClient()

  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setBlockMessage(isBlocked ? (currentPreference?.message ?? false) : false)
      setBlockCall(isBlocked ? (currentPreference?.call ?? false) : false)
      setBlockStory(isBlocked ? (currentPreference?.story ?? false) : false)
    }
  }

  const blockMutation = useMutation({
    mutationFn: () =>
      blockApi.blockUser({
        blockedUserId: userId,
        blockMessage,
        blockCall,
        blockStory
      }),
    onSuccess: () => {
      toast.success(text.settings.accountPrivacy.blockModal.blockSuccess(userName))
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.myBlocks() })
      onOpenChange(false)
    },
    onError: () => {
      toast.error(text.settings.accountPrivacy.blockModal.blockError)
    }
  })

  const updatePreferenceMutation = useMutation({
    mutationFn: () =>
      blockApi.updateBlockPreference(userId, {
        blockMessage,
        blockCall,
        blockStory
      }),
    onSuccess: () => {
      toast.success(text.settings.accountPrivacy.blockModal.updateSuccess)
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.myBlocks() })
      onOpenChange(false)
    },
    onError: () => {
      toast.error(text.settings.accountPrivacy.blockModal.updateError)
    }
  })

  const unblockMutation = useMutation({
    mutationFn: () => blockApi.unblockUser(userId),
    onSuccess: () => {
      toast.success(text.settings.accountPrivacy.blockModal.unblockSuccess(userName))
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.myBlocks() })
      onOpenChange(false)
    },
    onError: () => {
      toast.error(text.settings.accountPrivacy.blockModal.unblockError)
    }
  })

  const handleSubmit = () => {
    if (isBlocked) {
      updatePreferenceMutation.mutate()
    } else {
      blockMutation.mutate()
    }
  }

  const handleUnblock = () => {
    unblockMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Ban className='h-5 w-5 text-destructive' />
            {isBlocked
              ? text.settings.accountPrivacy.blockModal.editTitle
              : text.settings.accountPrivacy.blockModal.title}
          </DialogTitle>
          <DialogDescription>
            {isBlocked
              ? text.settings.accountPrivacy.blockModal.editDescription(userName)
              : text.settings.accountPrivacy.blockModal.description(userName)}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='flex items-center space-x-3'>
            <Checkbox
              id='blockMessage'
              checked={blockMessage}
              onCheckedChange={(checked) => setBlockMessage(checked as boolean)}
            />
            <Label htmlFor='blockMessage' className='flex items-center gap-2 cursor-pointer'>
              <MessageSquare className='h-4 w-4 text-muted-foreground' />
              <span>{text.settings.accountPrivacy.blockModal.blockMessage}</span>
            </Label>
          </div>

          <div className='flex items-center space-x-3'>
            <Checkbox
              id='blockCall'
              checked={blockCall}
              onCheckedChange={(checked) => setBlockCall(checked as boolean)}
            />
            <Label htmlFor='blockCall' className='flex items-center gap-2 cursor-pointer'>
              <Phone className='h-4 w-4 text-muted-foreground' />
              <span>{text.settings.accountPrivacy.blockModal.blockCall}</span>
            </Label>
          </div>

          <div className='flex items-center space-x-3'>
            <Checkbox
              id='blockStory'
              checked={blockStory}
              onCheckedChange={(checked) => setBlockStory(checked as boolean)}
            />
            <Label htmlFor='blockStory' className='flex items-center gap-2 cursor-pointer'>
              <Camera className='h-4 w-4 text-muted-foreground' />
              <span>{text.settings.accountPrivacy.blockModal.blockStory}</span>
            </Label>
          </div>
        </div>

        <DialogFooter className='gap-2'>
          {isBlocked && (
            <Button variant='outline' onClick={handleUnblock} disabled={unblockMutation.isPending}>
              {text.settings.accountPrivacy.blockModal.unblockButton}
            </Button>
          )}
          <Button variant='secondary' onClick={() => onOpenChange(false)}>
            {text.settings.accountPrivacy.blockModal.cancelButton}
          </Button>
          <Button
            variant='destructive'
            onClick={handleSubmit}
            disabled={blockMutation.isPending || updatePreferenceMutation.isPending}
          >
            {isBlocked
              ? text.settings.accountPrivacy.blockModal.updateButton
              : text.settings.accountPrivacy.blockModal.confirmButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
