import { useState } from 'react'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { OwnerProfileEditForm } from './owner-profile-edit-form'
import { useMyProfile } from '../../../queries/use-queries'
import { motion, AnimatePresence } from 'framer-motion'
import { BaseProfileDialog } from '../shared/base-profile-dialog'
import { OwnerProfileInfo } from './owner-profile-info'

interface OwnerProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OwnerProfileDialog({ open, onOpenChange }: OwnerProfileDialogProps) {
  const { user: authUser } = useAuthContext()
  const { data: userProfile } = useMyProfile()
  const { text } = useUserText()
  const [isEditing, setIsEditing] = useState(false)

  const user = userProfile || authUser

  if (!user) return null

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsEditing(false)
    }
    onOpenChange(newOpen)
  }

  return (
    <BaseProfileDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={isEditing ? text.profile.editTitle : text.profile.title}
      onBack={isEditing ? () => setIsEditing(false) : undefined}
      className={isEditing ? 'h-140' : 'h-160'}
    >
      <AnimatePresence initial={false} mode='wait'>
        {!isEditing ? (
          <motion.div
            key='info'
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className='flex-1 flex flex-col overflow-hidden'
          >
            <OwnerProfileInfo user={user} onEdit={() => setIsEditing(true)} />
          </motion.div>
        ) : (
          <motion.div
            key='edit'
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className='flex-1 flex flex-col overflow-hidden'
          >
            <OwnerProfileEditForm user={user} onCancel={() => setIsEditing(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </BaseProfileDialog>
  )
}
