import { useState, useEffect } from 'react'
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
  const [blockMessage, setBlockMessage] = useState(currentPreference?.message ?? true)
  const [blockCall, setBlockCall] = useState(currentPreference?.call ?? true)
  const [blockStory, setBlockStory] = useState(currentPreference?.story ?? true)
  const queryClient = useQueryClient()


  useEffect(() => {
    if (open) {
      setBlockMessage(currentPreference?.message ?? true)
      setBlockCall(currentPreference?.call ?? true)
      setBlockStory(currentPreference?.story ?? true)
    }
  }, [open, currentPreference])

  const blockMutation = useMutation({
    mutationFn: () =>
      blockApi.blockUser({
        blockedUserId: userId,
        blockMessage,
        blockCall,
        blockStory
      }),
    onSuccess: () => {
      toast.success(`Đã chặn ${userName}`)
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.myBlocks() })
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Không thể chặn người dùng này')
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
      toast.success('Đã cập nhật cài đặt chặn')
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.myBlocks() })
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Không thể cập nhật cài đặt')
    }
  })

  const unblockMutation = useMutation({
    mutationFn: () => blockApi.unblockUser(userId),
    onSuccess: () => {
      toast.success(`Đã bỏ chặn ${userName}`)
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.myBlocks() })
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Không thể bỏ chặn người dùng này')
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
            {isBlocked ? 'Cài đặt chặn' : 'Chặn người dùng'}
          </DialogTitle>
          <DialogDescription>
            {isBlocked
              ? `Tùy chỉnh cách bạn chặn ${userName}`
              : `Chọn những gì bạn muốn chặn từ ${userName}`}
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
              <span>Chặn tin nhắn</span>
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
              <span>Chặn cuộc gọi</span>
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
              <span>Chặn nhật ký</span>
            </Label>
          </div>
        </div>

        <DialogFooter className='gap-2'>
          {isBlocked && (
            <Button
              variant='outline'
              onClick={handleUnblock}
              disabled={unblockMutation.isPending}
            >
              Bỏ chặn
            </Button>
          )}
          <Button variant='secondary' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            variant='destructive'
            onClick={handleSubmit}
            disabled={blockMutation.isPending || updatePreferenceMutation.isPending}
          >
            {isBlocked ? 'Cập nhật' : 'Chặn'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
