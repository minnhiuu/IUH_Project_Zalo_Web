import { useState, useCallback } from 'react'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { useUserById } from '@/features/user/queries/use-queries'

interface UseOthersProfileProps {
  userId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const useOthersProfile = ({ userId, open, onOpenChange }: UseOthersProfileProps) => {
  const { user: authUser } = useAuthContext()
  const [isEditingMe, setIsEditingMe] = useState(false)
  const [prevUserId, setPrevUserId] = useState(userId)
  const [prevOpen, setPrevOpen] = useState(open)

  if (userId !== prevUserId || open !== prevOpen) {
    setPrevUserId(userId)
    setPrevOpen(open)
    if (userId !== prevUserId || !open) {
      setIsEditingMe(false)
    }
  }

  const { data: user, isLoading } = useUserById(userId || '')

  const isMe = !!authUser && !!userId && authUser.id === userId

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setIsEditingMe(false)
      }
      onOpenChange(newOpen)
    },
    [onOpenChange]
  )

  return {
    user,
    isMe,
    isLoading,
    isEditingMe,
    setIsEditingMe,
    handleOpenChange
  }
}
