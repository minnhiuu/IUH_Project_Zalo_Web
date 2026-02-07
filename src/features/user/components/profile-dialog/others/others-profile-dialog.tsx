import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import { useUserText } from '@/features/user/i18n/use-user-text'

import { OthersProfileInfo } from './others-profile-info'
import { OwnerProfileInfo } from '../owner/owner-profile-info'
import { OwnerProfileEditForm } from '../owner/owner-profile-edit-form'
import { BaseProfileDialog } from '../shared/base-profile-dialog'
import { useOthersProfile } from '../hooks/use-others-profile'

interface OthersProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string
}

export const OthersProfileDialog = ({ open, onOpenChange, userId }: OthersProfileDialogProps) => {
  const { text } = useUserText()
  const { user, isMe, isLoading, isEditingMe, setIsEditingMe, handleOpenChange } = useOthersProfile({
    userId,
    open,
    onOpenChange
  })

  if (!userId && open) return null

  return (
    <BaseProfileDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={isEditingMe ? text.profile.editTitle : text.profile.title}
      onBack={isEditingMe ? () => setIsEditingMe(false) : undefined}
      className='h-fit min-h-[400px] max-h-[750px]'
    >
      <div className='flex flex-col h-full bg-background'>
        {isLoading ? (
          <div className='flex h-[400px] items-center justify-center text-vibrant-blue'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        ) : !user ? (
          <div className='flex h-[400px] items-center justify-center text-muted-foreground'>User not found</div>
        ) : isMe ? (
          <AnimatePresence mode='wait'>
            {isEditingMe ? (
              <motion.div
                key='owner-edit'
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                className='flex-1 flex flex-col overflow-hidden'
              >
                <OwnerProfileEditForm user={user} onCancel={() => setIsEditingMe(false)} />
              </motion.div>
            ) : (
              <motion.div
                key='owner-info'
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                className='flex-1 flex flex-col overflow-hidden'
              >
                <OwnerProfileInfo user={user} onEdit={() => setIsEditingMe(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <OthersProfileInfo user={user} />
        )}
      </div>
    </BaseProfileDialog>
  )
}
